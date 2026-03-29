package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	ProductsCollection 		*mongo.Collection
	UsersCollection 		*mongo.Collection
	ShoppingListsCollection *mongo.Collection
)

func ConnectDB() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("MONGODB_URI not set in environment")
	}

	// connect to MongoDB
	mongoClient, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("MongoDB connection error:", err)
	}

	// create a context with timeout for ping
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// ping the database to verify connection
	if err := mongoClient.Ping(ctx, nil); err != nil {
		log.Fatal("MongoDB ping error:", err)
	}

	// get handles for the products, users, and shopping lists collections
	ProductsCollection = mongoClient.Database("cs-web-shopping-list").Collection("products")

	UsersCollection = mongoClient.Database("cs-web-shopping-list").Collection("users")

	ShoppingListsCollection =
		mongoClient.Database("cs-web-shopping-list").Collection("shopping_lists")
}
