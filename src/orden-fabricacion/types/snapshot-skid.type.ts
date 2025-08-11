export type SnapshotSkid = {
  paneles: Array<{ insumoId: number; cantidad: number }>;
  bombas:  Array<{ insumoId: number; cantidad: number }>;
  tableros: number[];      // IDs de RecetaProducto (p.ej. “Tablero Eléctrico”)
  instrumentos: number[];  // IDs de RecetaProducto
  extras: Array<{
    nombre: string;
    items: Array<{ insumoId: number; cantidad: number }>;
  }>;
  // flags/campos simples (opcionales)
  tanque?: boolean;
  calibracion?: boolean;
  psv?: string;
  baterias?: string | number;
  potenciaPaneles?: string | number;
};
