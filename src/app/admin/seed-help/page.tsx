import Link from 'next/link';

export default function SeedPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🌱 Cargar Productos</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Problema detectado:</h2>
          <p className="mb-4">Las políticas de seguridad de Supabase (RLS) están bloqueando las inserciones automáticas.</p>
          
          <h2 className="text-lg font-bold mb-2 mt-6">✅ Solución rápida:</h2>
          <ol className="list-decimal pl-6 space-y-2 mb-6">
            <li>Ve a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Supabase Dashboard</a></li>
            <li>Selecciona tu proyecto</li>
            <li>Ve a: <strong>SQL Editor</strong></li>
            <li>Copia y ejecuta esto:
              <pre className="bg-gray-900 p-3 rounded mt-2 overflow-x-auto">
{`ALTER TABLE products DISABLE ROW LEVEL SECURITY;`}
              </pre>
            </li>
            <li>Luego regresa aquí y presiona el botón de abajo</li>
          </ol>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="mb-4 text-gray-300">O alternativamente, carga los productos manualmente:</p>
          <Link 
            href="/seed-products"
            className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-bold"
          >
            Ir a Formulario de Productos
          </Link>
        </div>
      </div>
    </div>
  );
}
