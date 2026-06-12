import React, { useState, useMemo } from 'react';
import { Calculator, AlertCircle, CheckCircle2, ChevronRight, Info } from 'lucide-react';

// Diccionario de períodos (Simula una tabla temporal de paritarias en la DB)
const PERIODOS = {
  mayo2026: {
    nombre: "Mayo 2026",
    grid: {
      1: { basic: 2071851.68, sec: 120858.00, tec: 414370.00, uni: 517963.00, ter: 207185.00, ant: 41437.00, grado: 124311.00, cap: 62156.00, p8: 536610.00, p6: 344963.00, p4: 191646.00, p2: 76659.00, gar: 0, bono: 40000.00 },
      2: { basic: 1726545.86, sec: 120858.00, tec: 345309.00, uni: 431636.00, ter: 172655.00, ant: 34531.00, grado: 120858.00, cap: 69062.00, p8: 241714.00, p6: 155388.00, p4: 86326.00, p2: 34531.00, gar: 0, bono: 40000.00 },
      3: { basic: 1436504.78, sec: 120858.00, tec: 287301.00, uni: 359126.00, ter: 143650.00, ant: 28730.00, grado: 114920.00, cap: 71825.00, p8: 203029.00, p6: 130518.00, p4: 72510.00, p2: 29004.00, gar: 0, bono: 40000.00 },
      4: { basic: 1194787.22, sec: 120858.00, tec: 238957.00, uni: 298697.00, ter: 119479.00, ant: 23896.00, grado: 131427.00, cap: 71687.00, p8: 169202.00, p6: 108773.00, p4: 60429.00, p2: 24172.00, gar: 70000.00, bono: 40000.00 },
      5: { basic: 994491.85, sec: 120858.00, tec: 198898.00, uni: 248623.00, ter: 99449.00, ant: 19890.00, grado: 139229.00, cap: 69614.00, p8: 140207.00, p6: 90133.00, p4: 50074.00, p2: 20030.00, gar: 100000.00, bono: 40000.00 },
      6: { basic: 828732.04, sec: 120858.00, tec: 165746.00, uni: 207183.00, ter: 82873.00, ant: 16575.00, grado: 190608.00, cap: 66299.00, p8: 116032.00, p6: 74592.00, p4: 41440.00, p2: 16576.00, gar: 150000.00, bono: 40000.00 },
      7: { basic: 690617.33, sec: 120858.00, tec: 138123.00, uni: 172654.00, ter: 69062.00, ant: 13812.00, grado: 186467.00, cap: 69062.00, p8: 96680.00, p6: 62152.00, p4: 34529.00, p2: 13811.00, gar: 220000.00, bono: 40000.00 }
    }
  },
  junio2026: {
    nombre: "Junio 2026",
    grid: {
      1: { basic: 2513777.64, sec: 146637.05, tec: 502755.53, uni: 628444.41, ter: 251377.76, ant: 50275.55, grado: 150826.66, cap: 75413.33, p8: 651068.41, p6: 418543.98, p4: 232524.43, p2: 93009.77, gar: 0, bono: 0 },
      2: { basic: 2094818.09, sec: 146637.05, tec: 418963.62, uni: 523704.52, ter: 209481.81, ant: 41896.36, grado: 146637.27, cap: 83792.72, p8: 293271.69, p6: 188531.80, p4: 104739.89, p2: 41895.96, gar: 0, bono: 0 },
      3: { basic: 1742911.25, sec: 146637.05, tec: 348582.25, uni: 435727.81, ter: 174291.12, ant: 34858.22, grado: 139432.90, cap: 87145.56, p8: 246334.79, p6: 158358.08, p4: 87976.71, p2: 35190.68, gar: 0, bono: 0 },
      4: { basic: 1449635.33, sec: 146637.05, tec: 289927.07, uni: 362408.83, ter: 144963.53, ant: 28992.71, grado: 159459.89, cap: 86978.12, p8: 205293.14, p6: 131974.16, p4: 73318.98, p2: 29327.59, gar: 70000.00, bono: 0 },
      5: { basic: 1206616.96, sec: 146637.05, tec: 241323.39, uni: 301654.24, ter: 120661.70, ant: 24132.34, grado: 168926.37, cap: 84463.19, p8: 170112.86, p6: 109358.27, p4: 60754.59, p2: 24301.84, gar: 100000.00, bono: 0 },
      6: { basic: 1005500.58, sec: 146637.05, tec: 201100.12, uni: 251375.15, ter: 100550.06, ant: 20110.01, grado: 231265.13, cap: 80440.05, p8: 140781.46, p6: 90502.37, p4: 50279.09, p2: 20111.64, gar: 150000.00, bono: 0 },
      7: { basic: 837926.01, sec: 146637.05, tec: 167585.20, uni: 209481.50, ter: 83792.60, ant: 16758.52, grado: 226240.02, cap: 83792.60, p8: 117302.20, p6: 75408.56, p4: 41893.64, p2: 16757.46, gar: 220000.00, bono: 0 }
    }
  }
};

const VALE_ALIMENTARIO = 39.76;
const SEGURO_OBLIGATORIO = 3.80;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(amount);
};

export default function App() {
  const [form, setForm] = useState({
    periodo: 'junio2026',
    catRevista: 7,
    hasMayorResp: false,
    catMayorResp: 6,
    titulo: 'ninguno',
    antiguedad: 0,
    permanencia: 0,
    cobraAsistencial: false,
    cobraFalloCaja: false,
    aportaATUNCU: false,
    aportaICUNC: false,
    socioDeportes: false
  });

  const [receipt, setReceipt] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const calculateSalary = (e) => {
    e.preventDefault();

    const catRev = Number(form.catRevista);
    const catMR = Number(form.catMayorResp);
    
    // Extraemos la matriz de datos del período seleccionado
    const SALARY_GRID = PERIODOS[form.periodo].grid;
    
    // Validaciones de negocio simples
    if (form.hasMayorResp && catMR >= catRev) {
      alert("Error: La categoría de Mayor Responsabilidad debe ser numéricamente inferior (jerarquía superior) a la de Revista.");
      return;
    }
    if (form.antiguedad < form.permanencia) {
      alert("Error: La permanencia en la categoría no puede ser mayor a la antigüedad total.");
      return;
    }

    const effectiveCat = form.hasMayorResp ? catMR : catRev;
    const gridData = SALARY_GRID[effectiveCat];
    const revistaData = SALARY_GRID[catRev];

    let haberes = [];
    let descuentos = [];

    // --- HABERES ---
    // Básico
    const basico = gridData.basic;
    haberes.push({ label: 'Sueldo Básico', amount: basico, remunerativo: true });

    // Título
    let tituloMonto = 0;
    if (form.titulo === 'secundario') tituloMonto = gridData.sec;
    else if (form.titulo === 'terciario') tituloMonto = gridData.ter;
    else if (form.titulo === 'tecnicatura') tituloMonto = gridData.tec;
    else if (form.titulo === 'universitario') tituloMonto = gridData.uni;
    else if (form.titulo === 'posgrado') tituloMonto = basico * 0.30; // Mantenemos el cálculo dinámico del 30% como regla general
    
    if (tituloMonto > 0) {
      haberes.push({ label: `Adicional Título (${form.titulo})`, amount: tituloMonto, remunerativo: true });
    }

    // Antigüedad
    const antiguedadMonto = gridData.ant * form.antiguedad;
    if (antiguedadMonto > 0) {
      haberes.push({ label: `Antigüedad (${form.antiguedad} años)`, amount: antiguedadMonto, remunerativo: true });
    }

    // Permanencia (Se calcula estrictamente sobre la categoría de Revista)
    let permanenciaMonto = 0;
    if (form.permanencia == 2) permanenciaMonto = revistaData.p2;
    else if (form.permanencia == 4) permanenciaMonto = revistaData.p4;
    else if (form.permanencia == 6) permanenciaMonto = revistaData.p6;
    else if (form.permanencia >= 8) permanenciaMonto = revistaData.p8;

    if (permanenciaMonto > 0) {
      haberes.push({ label: `Permanencia (${form.permanencia} años - s/ Cat. Revista)`, amount: permanenciaMonto, remunerativo: true });
    }

    // Adicional Grado y Capacitación
    haberes.push({ label: 'Adicional Grado', amount: gridData.grado, remunerativo: true });
    haberes.push({ label: 'Adicional Capacitación', amount: gridData.cap, remunerativo: true });

    // Bono Extraordinario (RYNB) - Presente en Mayo, no en Junio
    if (gridData.bono > 0) {
      haberes.push({ label: 'Bono Extraordinario (RYNB)', amount: gridData.bono, remunerativo: true });
    }

    // Garantía Salarial (NRNB)
    if (gridData.gar > 0) {
      haberes.push({ label: 'Garantía Salarial (NRNB)', amount: gridData.gar, remunerativo: false });
    }

    // Adicional Asistencial (12% de la categoría asignada)
    if (form.cobraAsistencial) {
      const asistencial = gridData.basic * 0.12;
      haberes.push({ label: 'Adicional Asistencial', amount: asistencial, remunerativo: true });
    }

    // Fallo de Caja (25% del básico de categoría 7 del período actual)
    if (form.cobraFalloCaja) {
      const falloCaja = SALARY_GRID[7].basic * 0.25;
      haberes.push({ label: 'Fallo de Caja', amount: falloCaja, remunerativo: true });
    }

    // Vale Alimentario (Remunerativo)
    haberes.push({ label: 'Vale Alimentario', amount: VALE_ALIMENTARIO, remunerativo: true });

    // --- CÁLCULO DE BASES ---
    const baseImponible = haberes.filter(h => h.remunerativo).reduce((acc, curr) => acc + curr.amount, 0);
    const totalHaberes = haberes.reduce((acc, curr) => acc + curr.amount, 0);

    // --- DESCUENTOS ---
    const jubilacion = baseImponible * 0.11;
    descuentos.push({ label: 'Jubilación', amount: jubilacion });

    const ley19032 = baseImponible * 0.03;
    descuentos.push({ label: 'Ley 19032', amount: ley19032 });

    const damsu = baseImponible * 0.06;
    descuentos.push({ label: 'Obra Social DAMSU', amount: damsu });

    if (form.aportaATUNCU) {
      descuentos.push({ label: 'Sindicato ATUNCU', amount: baseImponible * 0.02 });
      descuentos.push({ label: 'Aporte FATUN', amount: baseImponible * 0.0075 });
    }

    if (form.aportaICUNC) {
      descuentos.push({ label: 'Instituto ICUNC', amount: baseImponible * 0.02 });
    }

    if (form.socioDeportes) {
      const aportesDeportes = SALARY_GRID[6].basic * 0.01; 
      descuentos.push({ label: 'Socio Deportes Cod. 61', amount: aportesDeportes });
    }

    descuentos.push({ label: 'Seguro Vida Obligatorio', amount: SEGURO_OBLIGATORIO });

    const totalDescuentos = descuentos.reduce((acc, curr) => acc + curr.amount, 0);
    const sueldoNeto = totalHaberes - totalDescuentos;

    setReceipt({
      haberes,
      descuentos,
      baseImponible,
      totalHaberes,
      totalDescuentos,
      sueldoNeto,
      metadata: { 
        effectiveCat, 
        catRev,
        nombrePeriodo: PERIODOS[form.periodo].nombre
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            Simulador Salarial Nodocente
          </h1>
          <p className="text-slate-500 mt-2 flex items-center gap-1">
            <Info className="w-4 h-4" />
            Basado en CCT 366/06 - Valores Dinámicos según período
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Formulario de Configuración */}
          <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold border-b pb-2">Parámetros de Liquidación</h2>
            
            <form onSubmit={calculateSalary} className="space-y-5">
              
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <label className="block text-sm font-semibold text-blue-900 mb-1">Período a Simular</label>
                <select 
                  name="periodo" 
                  value={form.periodo} 
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-blue-300 p-2 bg-white text-blue-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {Object.entries(PERIODOS).map(([key, data]) => (
                    <option key={key} value={key}>{data.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría de Revista</label>
                  <select 
                    name="catRevista" 
                    value={form.catRevista} 
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(cat => (
                      <option key={cat} value={cat}>Categoría {cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="hasMayorResp" 
                    name="hasMayorResp" 
                    checked={form.hasMayorResp} 
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="hasMayorResp" className="text-sm font-medium text-slate-700">Subroga Mayor Responsabilidad</label>
                </div>

                {form.hasMayorResp && (
                  <div className="pl-6 animate-in slide-in-from-top-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría Asignada (MR)</label>
                    <select 
                      name="catMayorResp" 
                      value={form.catMayorResp} 
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-blue-300 p-2 bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].filter(c => c < form.catRevista).map(cat => (
                        <option key={cat} value={cat}>Categoría {cat}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título Obtenido</label>
                  <select 
                    name="titulo" 
                    value={form.titulo} 
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ninguno">Ninguno</option>
                    <option value="secundario">Secundario</option>
                    <option value="terciario">Terciario/Pregrado</option>
                    <option value="tecnicatura">Tecnicatura Ges. Univ.</option>
                    <option value="universitario">Universitario</option>
                    <option value="posgrado">Posgrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Antigüedad (Años)</label>
                  <input 
                    type="number" 
                    name="antiguedad" 
                    min="0" 
                    value={form.antiguedad} 
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Permanencia en la Categoría</label>
                <select 
                  name="permanencia" 
                  value={form.permanencia} 
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="0">Menos de 2 años</option>
                  <option value="2">2 Años</option>
                  <option value="4">4 Años</option>
                  <option value="6">6 Años</option>
                  <option value="8">8 Años o más</option>
                </select>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">Otros Adicionales (Haberes)</h3>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="cobraAsistencial" checked={form.cobraAsistencial} onChange={handleInputChange} className="rounded" />
                  Adicional Asistencial
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="cobraFalloCaja" checked={form.cobraFalloCaja} onChange={handleInputChange} className="rounded" />
                  Fallo de Caja
                </label>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">Aportes y Retenciones</h3>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="aportaATUNCU" checked={form.aportaATUNCU} onChange={handleInputChange} className="rounded" />
                  Afiliada/o Sindicato ATUNCU / FATUN
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="aportaICUNC" checked={form.aportaICUNC} onChange={handleInputChange} className="rounded" />
                  Aporte Instituto de Complementación ICUNC
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="socioDeportes" checked={form.socioDeportes} onChange={handleInputChange} className="rounded" />
                  Socia/o Deportes (Cod. 61)
                </label>
              </div>

              <button 
                type="submit" 
                className="w-full mt-6 bg-slate-900 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                Procesar Simulación <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Columna Derecha: Recibo / Resultados */}
          <div className="lg:col-span-7">
            {!receipt ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 p-8 text-center">
                <Calculator className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Esperando parámetros</p>
                <p className="text-sm mt-2">Selecciona el período, configura tu situación y oprime "Procesar Simulación".</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Resumen de Liquidación</h2>
                    <p className="text-slate-300 text-sm">
                      Período: <span className="font-semibold text-blue-300">{receipt.metadata.nombrePeriodo}</span> | Base: Cat. {receipt.metadata.effectiveCat} {form.hasMayorResp && `(S. de ${receipt.metadata.catRev})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300 uppercase tracking-wide">Neto a Cobrar</p>
                    <p className="text-3xl font-bold text-emerald-400">{formatCurrency(receipt.sueldoNeto)}</p>
                  </div>
                </div>

                <div className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3">Concepto</th>
                        <th className="px-6 py-3 text-right">Haberes</th>
                        <th className="px-6 py-3 text-right">Descuentos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {receipt.haberes.map((item, idx) => (
                        <tr key={`h-${idx}`} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-medium text-slate-700">{item.label}</td>
                          <td className="px-6 py-3 text-right text-slate-900">{formatCurrency(item.amount)}</td>
                          <td className="px-6 py-3 text-right text-slate-400">-</td>
                        </tr>
                      ))}
                      
                      <tr><td colSpan="3" className="bg-slate-50 py-1"></td></tr>

                      {receipt.descuentos.map((item, idx) => (
                        <tr key={`d-${idx}`} className="hover:bg-red-50/30">
                          <td className="px-6 py-3 font-medium text-slate-600">{item.label}</td>
                          <td className="px-6 py-3 text-right text-slate-400">-</td>
                          <td className="px-6 py-3 text-right text-red-600">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                      <tr>
                        <td className="px-6 py-4 text-slate-700 uppercase tracking-wide text-xs">
                          <div>Total Haberes</div>
                          <div className="text-[10px] text-slate-500 font-normal normal-case mt-1">Base Imponible Desc: {formatCurrency(receipt.baseImponible)}</div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-900 align-top">{formatCurrency(receipt.totalHaberes)}</td>
                        <td className="px-6 py-4 text-right text-red-600 align-top">{formatCurrency(receipt.totalDescuentos)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
