import React from "react";
import { TableProvider } from "./components/TableContext";
import Table from "./components/Table";

function App() {
    return (
        <TableProvider>
            <Table />
        </TableProvider>
    );
}

export default App;