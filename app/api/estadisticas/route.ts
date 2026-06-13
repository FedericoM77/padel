import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [parejas, partidos] = await Promise.all([
      prisma.pareja.findMany({ orderBy: { puntosRanking: "desc" }, take: 10 }),
      prisma.partido.findMany({
        where: { estado: "FINALIZADO" },
        include: { torneo: { select: { nombre: true } } },
      }),
    ]);

    // Distribución de victorias por pareja (top 8)
    const topParejas = parejas.slice(0, 8).map((p, i) => ({
      nombre: `${p.nombreJugador1.split(" ")[0]}/${p.nombreJugador2.split(" ")[0]}`,
      puntos: p.puntosRanking,
      ganados: p.partidosGanados,
      jugados: p.partidosJugados,
      winRate: p.partidosJugados > 0 ? Math.round((p.partidosGanados / p.partidosJugados) * 100) : 0,
    }));

    // Partidos por torneo
    const partidosPorTorneo: Record<string, number> = {};
    for (const p of partidos) {
      const nombre = p.torneo.nombre;
      partidosPorTorneo[nombre] = (partidosPorTorneo[nombre] ?? 0) + 1;
    }

    const distribucionTorneos = Object.entries(partidosPorTorneo).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }));

    return NextResponse.json({ topParejas, distribucionTorneos, totalPartidos: partidos.length });
  } catch {
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
