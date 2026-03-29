package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/cipher0ne/shopping-list/backend/models"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// Handles /products (GET, POST)
func AllProductsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		AddProduct(w, r)
	case http.MethodGet:
		GetProducts(w, r)
	default:
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	}
}

// Handles /products/{id} (PATCH, DELETE)
func ProductHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPatch:
		UpdateProduct(w, r)
	case http.MethodDelete:
		DeleteProduct(w, r)
	default:
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	}
}

func GetUserIDFromToken(r *http.Request) (primitive.ObjectID, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return primitive.NilObjectID, http.ErrNoCookie
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		return primitive.NilObjectID, jwt.ErrSignatureInvalid
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || claims["userID"] == nil {
		return primitive.NilObjectID, jwt.ErrSignatureInvalid
	}

	userIDHex, ok := claims["userID"].(string)
	if !ok {
		return primitive.NilObjectID, jwt.ErrSignatureInvalid
	}

	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		return primitive.NilObjectID, jwt.ErrSignatureInvalid
	}

	return userID, nil
}

func GetUsershoppingList(userID primitive.ObjectID) (models.ShoppingList, error) {
	var shoppingList models.ShoppingList
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := ShoppingListsCollection.FindOne(ctx, bson.M{"userID": userID}).Decode(&shoppingList)
	return shoppingList, err
}

func AddProduct(w http.ResponseWriter, r *http.Request) {
	userID, err := GetUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// find the shopping list of this user
	shoppingList, err := GetUsershoppingList(userID)
	if err != nil {
		http.Error(w, "Shopping list not found", http.StatusNotFound)
		return
	}

	// decode product from request body and give it IDs
	var product models.Product
	err = json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	product.ID = primitive.NewObjectID()
	product.ShoppingListID = shoppingList.ID

	// insert product
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := ProductsCollection.InsertOne(ctx, product)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"insertedID": res.InsertedID,
	})
}

func GetProducts(w http.ResponseWriter, r *http.Request) {
	userID, err := GetUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// find the shopping list of this user
	shoppingList, err := GetUsershoppingList(userID)
	if err != nil {
		http.Error(w, "Shopping list not found", http.StatusNotFound)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// find products that belong to this user's list
	cursor, err := ProductsCollection.Find(ctx, bson.M{"shoppingListID": shoppingList.ID})
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err = cursor.All(ctx, &products); err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(products)
}

func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	userID, err := GetUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// find the shopping list of this user
	shoppingList, err := GetUsershoppingList(userID)
	if err != nil {
		http.Error(w, "Shopping list not found", http.StatusNotFound)
		return
	}

	// get product ID from URL
	id := strings.TrimPrefix(r.URL.Path, "/products/")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// decode updated product data from request body
	var updates map[string]any
	err = json.NewDecoder(r.Body).Decode(&updates)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	update := bson.M{"$set": updates}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// only update products that belong to the user
	filter := bson.M{"_id": objID, "shoppingListID": shoppingList.ID}

	res, err := ProductsCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"matchedCount":  res.MatchedCount,
		"modifiedCount": res.ModifiedCount,
	})
}

func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	userID, err := GetUserIDFromToken(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// find the shopping list of this user
	shoppingList, err := GetUsershoppingList(userID)
	if err != nil {
		http.Error(w, "Shopping list not found", http.StatusNotFound)
		return
	}

	// get product ID from URL
	id := strings.TrimPrefix(r.URL.Path, "/products/")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// filter out the product by id passed in the URL and only if it belong to the user's list
	filter := bson.M{"_id": objID, "shoppingListID": shoppingList.ID}

	res, err := ProductsCollection.DeleteOne(ctx, filter)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"deletedCount": res.DeletedCount,
	})
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// password hashing
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// check if user already exists
	var existingUser models.User
	result := UsersCollection.FindOne(ctx, bson.M{"email": req.Email})
	// if user was found Decode will return nil error
	err = result.Decode(&existingUser)
	if err == nil {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	// create user
	user := models.User{
		ID:       primitive.NewObjectID(),
		Email:    req.Email,
		Password: string(hashedPassword),
	}
	_, err = UsersCollection.InsertOne(ctx, user)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	// create shopping list for user
	shoppingList := models.ShoppingList{
		ID:     primitive.NewObjectID(),
		UserID: user.ID,
	}
	_, err = ShoppingListsCollection.InsertOne(ctx, shoppingList)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"userID": user.ID,
	})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// check if email exists in the database
	var user models.User
	err = UsersCollection.FindOne(ctx, bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// compare password with hashed password in the database
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": user.ID.Hex(),
		"exp":    time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"token": tokenString,
	})
}
