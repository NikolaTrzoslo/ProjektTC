package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type ShoppingList struct {
	ID			primitive.ObjectID  `json:"_id" bson:"_id,omitempty"`
	UserID		primitive.ObjectID  `json:"userId" bson:"userId"`
}
