package main

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var ProductsCollection *mongo.Collection

func ConnectDB() {
	uri := "mongodb+srv://j_db_user:BWz6VqT2GgoZBgUu@cs-web-shopping-list.q1uo6ax.mongodb.net/?appName=cs-web-shopping-list"

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

	// get a handle for the products collection
	ProductsCollection = mongoClient.Database("cs-web-shopping-list").Collection("products")
}
