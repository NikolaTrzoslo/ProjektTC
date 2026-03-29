package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Product struct {
	ID				primitive.ObjectID  `json:"_id" bson:"_id,omitempty"`
	ShoppingListID	primitive.ObjectID  `json:"shoppingListID" bson:"shoppingListID"`
	Name			string				`json:"name" bson:"name"`
	Quantity		int					`json:"quantity" bson:"quantity"`
	Bought			bool				`json:"bought" bson:"bought"`
}
