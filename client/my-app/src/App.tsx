import { useState } from "react"
import "./App.css"

function Product({id}: {id: number}) {
  return (
    <div className="product">
      <p>{id}</p>
      <p>Name</p>
      <p>Quantity</p>
      <p>Bought?</p>
    </div>
  )
}

type ProductT = { id: number };

function App() {
  const [products, setItems] = useState<ProductT[]>([]);

  const addItem = () => {
    setItems(prev => [{ id: prev.length + 1 }, ...prev]);
  };

  return (
    <>
      <section id="list-section">
        <div id="list">
          <button id="new-item-button" className="button" onClick={addItem}>
            <span style={{ color: "#cba6f7" }}>+</span> New item
          </button>
          {products.map((item) => (
            <Product key={item.id} id={item.id} />
          ))}
        </div>
      </section>
    </>
  )
}

export default App
