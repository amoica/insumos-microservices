export class Insumo {

    public id: string;            // Identificador único
    public name: string;          // Nombre del insumo
    public price: number;         // Precio de venta
    public category: string;      // Categoría del insumo (e.g., memoria, disco, fuente)
    public subcategory: string;   // Subcategoría del insumo (e.g., RAM, SSD, PSU)
    public code: string;          // Código del insumo
    public description: string;   // Descripción del insumo
    public condition: string;     // Estado del insumo (nuevo, usado)
    public costPrice: number;     // Precio de costo
    public location: string;
    public currentStock: number;
    public committedStock: number;
    public incomingStock: number;
    public minimunStock: number;

}
