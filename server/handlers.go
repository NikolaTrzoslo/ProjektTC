package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/cipher0ne/shopping-list/backend/models"
)

func AddProduct(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		http.Error(response, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var product models.Product
	err := json.NewDecoder(request.Body).Decode(&product)
	if err != nil {
		http.Error(response, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := ProductsCollection.InsertOne(ctx, product)
	if err != nil {
		http.Error(response, "Database error", http.StatusInternalServerError)
		return
	}

	response.Header().Set("Content-Type", "application/json")
	json.NewEncoder(response).Encode(map[string]interface{}{
		"insertedID": res.InsertedID,
	})
}

// func UpdateProduct(response http.ResponseWriter, request *http.Request) {}

// func GetProducts(response http.ResponseWriter, request *http.Request) {}

// func DeleteProduct(response http.ResponseWriter, request *http.Request) {}
