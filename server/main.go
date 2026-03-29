package main

import (
	"fmt"
	"net/http"

	"github.com/rs/cors"
)

func ping(response http.ResponseWriter, request *http.Request) {
	fmt.Fprintf(response, "pong\n")
}

func main() {
	http.HandleFunc("/ping", ping)

	ConnectDB()
	http.HandleFunc("/products", AllProductsHandler)
	http.HandleFunc("/products/", ProductHandler)
	http.HandleFunc("/register", RegisterHandler)
	http.HandleFunc("/login", LoginHandler)

	c := cors.Default()
	handler := c.Handler(http.DefaultServeMux)
	err := http.ListenAndServe(":8080", handler)
	if err != nil {
		fmt.Println("Server error:", err)
	}
}
