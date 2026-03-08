package main

import (
	"fmt"
	"net/http"
)

func ping(response http.ResponseWriter, request *http.Request) {
	fmt.Fprintf(response, "pong\n")
}

func main() {
	http.HandleFunc("/ping", ping)

	ConnectDB()
	http.HandleFunc("/products", AddProduct)
	//http.HandleFunc("/products/list", GetProducts)

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Server error:", err)
	}
}
