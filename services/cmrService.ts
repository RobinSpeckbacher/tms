import type { Template } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { text, rectangle } from "@pdfme/schemas";
import type { Truck } from "@/hooks/useTrucks";
import type { SendungRow } from "@/hooks/useSendungen";

/* ── Plugins ──────────────────────────────────────────────────────── */
const plugins = { Text: text, Rectangle: rectangle };

/* ── Layout constants ─────────────────────────────────────────────── */
const L = 8; // left margin
const R = 202; // right edge
const W = R - L; // full width = 194
const MID = 105; // vertical divider
const LW = MID - L; // left col width = 97
const RW = R - MID; // right col width = 97
const BW = 0.4; // border width
const BC = "#94a3b8"; // border color (slate-400)
const FS = 9; // font size
const LS = 6.5; // label size
const HS = 12; // header size

/* ── Helper: rectangle border schema ──────────────────────────────── */
function box(name: string, x: number, y: number, w: number, h: number) {
  return {
    name,
    type: "rectangle" as const,
    position: { x, y },
    width: w,
    height: h,
    borderWidth: BW,
    borderColor: BC,
    color: "",
  };
}

/* ── Helper: label text ───────────────────────────────────────────── */
function lbl(name: string, x: number, y: number, w: number) {
  return {
    name,
    type: "text" as const,
    position: { x, y },
    width: w,
    height: 5,
    fontSize: LS,
    fontColor: "#155dfc",
  };
}

/* ── Helper: value text ───────────────────────────────────────────── */
function txt(
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  extra?: Record<string, unknown>,
) {
  return {
    name,
    type: "text" as const,
    position: { x, y },
    width: w,
    height: h,
    fontSize: FS,
    lineHeight: 1.4,
    fontColor: "#0f172b",
    ...extra,
  };
}

/* ── Row Y positions ─────────────────────────────────────────────── */
const TY = 5,
  TH = 20; // title
const R1Y = TY + TH,
  R1H = 32; // row 1
const R2Y = R1Y + R1H,
  R2H = 32; // row 2
const R3Y = R2Y + R2H,
  R3H = 24; // row 3
const R4Y = R3Y + R3H,
  R4H = 24; // row 4
const R5Y = R4Y + R4H,
  R5H = 75; // goods
const R6Y = R5Y + R5H,
  R6H = 16; // totals
const R7Y = R6Y + R6H,
  R7H = 20; // instructions
const R8Y = R7Y + R7H,
  R8H = 18; // place/date
const R9Y = R8Y + R8H,
  R9H = 20; // signatures
const SW = W / 3; // signature col width

/* ── CMR Template ─────────────────────────────────────────────────── */
const cmrTemplate: Template = {
  basePdf: { width: 210, height: 297, padding: [3, 3, 3, 3] },
  schemas: [
    [
      // ── Border rectangles ──
      box("b_title", L, TY, W, TH),
      box("b_1", L, R1Y, LW, R1H),
      box("b_cmr", MID, R1Y, RW, R1H),
      box("b_2", L, R2Y, LW, R2H),
      box("b_16", MID, R2Y, RW, R2H),
      box("b_3", L, R3Y, LW, R3H),
      box("b_veh", MID, R3Y, RW, R3H),
      box("b_4", L, R4Y, LW, R4H),
      box("b_drv", MID, R4Y, RW, R4H),
      box("b_goods", L, R5Y, W, R5H),
      box("b_totals", L, R6Y, W, R6H),
      box("b_instr", L, R7Y, W, R7H),
      box("b_place", L, R8Y, LW, R8H),
      box("b_date", MID, R8Y, RW, R8H),
      box("b_sig1", L, R9Y, SW, R9H),
      box("b_sig2", L + SW, R9Y, SW, R9H),
      box("b_sig3", L + SW * 2, R9Y, SW, R9H),

      // ── Title ──
      txt("title", L, TY + 2, W, 10, {
        fontSize: 14,
        alignment: "center",
      }),
      txt("subtitle", L + 10, TY + 12, W - 20, 6, {
        fontSize: 6.5,
        alignment: "center",
        fontColor: "#57688e",
      }),

      // ── Row 1 left: Absender ──
      lbl("label_1", L + 2, R1Y + 1.5, LW - 4),
      txt("absender", L + 2, R1Y + 7, LW - 4, R1H - 9),

      // ── Row 1 right: CMR Nr + Datum ──
      lbl("label_cmr_nr", MID + 2, R1Y + 1.5, RW - 4),
      txt("cmr_nr", MID + 2, R1Y + 7, RW - 4, 8, { fontSize: HS }),
      lbl("label_datum", MID + 2, R1Y + 17, RW - 4),
      txt("datum", MID + 2, R1Y + 23, RW - 4, 7),

      // ── Row 2 left: Empfänger ──
      lbl("label_2", L + 2, R2Y + 1.5, LW - 4),
      txt("empfaenger", L + 2, R2Y + 7, LW - 4, R2H - 9),

      // ── Row 2 right: Frächter ──
      lbl("label_16", MID + 2, R2Y + 1.5, RW - 4),
      txt("fraechter", MID + 2, R2Y + 7, RW - 4, R2H - 9),

      // ── Row 3 left: Auslieferungsort ──
      lbl("label_3", L + 2, R3Y + 1.5, LW - 4),
      txt("auslieferungsort", L + 2, R3Y + 7, LW - 4, R3H - 9),

      // ── Row 3 right: Fahrzeug ──
      lbl("label_fahrzeug", MID + 2, R3Y + 1.5, RW - 4),
      txt("fahrzeug", MID + 2, R3Y + 7, RW - 4, R3H - 9),

      // ── Row 4 left: Übernahmeort ──
      lbl("label_4", L + 2, R4Y + 1.5, LW - 4),
      txt("uebernahmeort", L + 2, R4Y + 7, LW - 4, R4H - 9),

      // ── Row 4 right: Fahrer ──
      lbl("label_fahrer", MID + 2, R4Y + 1.5, RW - 4),
      txt("fahrer_info", MID + 2, R4Y + 7, RW - 4, R4H - 9),

      // ── Row 5: Goods table ──
      lbl("label_6", L + 2, R5Y + 1.5, W - 4),
      txt("goods_header", L + 2, R5Y + 7, W - 4, 5, {
        fontSize: 6.5,
        fontColor: "#57688e",
      }),
      txt("goods_data", L + 2, R5Y + 13, W - 4, R5H - 15),

      // ── Row 6: Totals ──
      lbl("label_totals", L + 2, R6Y + 1.5, W - 4),
      txt("totals", L + 2, R6Y + 7, W - 4, 7),

      // ── Row 7: Instructions ──
      lbl("label_13", L + 2, R7Y + 1.5, W - 4),
      txt("anweisungen", L + 2, R7Y + 7, W - 4, R7H - 9),

      // ── Row 8 left: Place of issue ──
      lbl("label_ausstellung", L + 2, R8Y + 1.5, LW - 4),
      txt("ausstellungsort", L + 2, R8Y + 7, LW - 4, R8H - 9),

      // ── Row 8 right: Date of issue ──
      lbl("label_ausstellungsdatum", MID + 2, R8Y + 1.5, RW - 4),
      txt("ausstellungsdatum", MID + 2, R8Y + 7, RW - 4, R8H - 9),

      // ── Row 9: Signatures ──
      lbl("label_sig_absender", L + 2, R9Y + 1.5, SW - 4),
      lbl("label_sig_fraechter", L + SW + 2, R9Y + 1.5, SW - 4),
      lbl("label_sig_empfaenger", L + SW * 2 + 2, R9Y + 1.5, SW - 4),
    ],
  ],
};

/* ── Build inputs from Truck + Sendungen ─────────────────────────── */

const PE_LABELS: Record<string, string> = {
  europalette: "Europalette",
  industriepalette: "Industriepal.",
  gitterbox: "Gitterbox",
  colli: "Colli",
  sonstige: "Stk",
};

function buildCmrInputs(truck: Truck, sendungen: SendungRow[]) {
  const ladeOrte = [
    ...new Set(
      sendungen.map((s) =>
        [s.lade_ort, s.lade_plz, s.lade_land].filter(Boolean).join(", "),
      ),
    ),
  ];
  const entladeOrte = [
    ...new Set(
      sendungen.map((s) =>
        [s.entlade_ort, s.entlade_plz, s.entlade_land].filter(Boolean).join(", "),
      ),
    ),
  ];
  const ladeAdressen = [
    ...new Set(sendungen.map((s) => s.lade_adresse).filter(Boolean)),
  ];
  const entladeAdressen = [
    ...new Set(sendungen.map((s) => s.entlade_adresse).filter(Boolean)),
  ];

  let totalGewicht = 0;
  let totalAnzahl = 0;
  let totalLdm = 0;
  for (const s of sendungen) {
    totalGewicht += s.gewicht ?? 0;
    totalAnzahl += s.anzahl ?? 0;
    totalLdm += s.lademeter ?? 0;
  }

  const hasText = (value: string | null | undefined) =>
    typeof value === "string" && value.trim().length > 0;

  const goodsLines = sendungen.map((s) => {
    const packungseinheit = hasText(s.packungseinheit)
      ? s.packungseinheit
      : null;
    const pe = packungseinheit !== null
      ? (PE_LABELS[packungseinheit] ?? packungseinheit)
      : "";
    const parts = [
      s.referenz.padEnd(20),
      s.lade_ort,
      " → ",
      s.entlade_ort,
      "  |  ",
      s.anzahl != null ? `${s.anzahl} ${pe}` : "",
      "  |  ",
      s.gewicht != null
        ? s.gewicht >= 1000
          ? `${(s.gewicht / 1000).toFixed(1)} t`
          : `${s.gewicht} kg`
        : "",
      "  |  ",
      s.lademeter != null ? `${s.lademeter} ldm` : "",
    ];
    return parts.filter(Boolean).join("");
  });

  const absenderText =
    ladeOrte.length > 0
      ? [
          ...(sendungen[0]?.kunde ? [sendungen[0].kunde.name] : []),
          ...ladeAdressen,
          ...ladeOrte,
        ].join("\n")
      : "–";

  const empfaengerText =
    entladeOrte.length > 0
      ? [...entladeAdressen, ...entladeOrte].join("\n")
      : "–";

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, "0")}.${(now.getMonth() + 1).toString().padStart(2, "0")}.${now.getFullYear()}`;

  const fahrerName = hasText(truck.fahrer) ? truck.fahrer : "–";
  const fahrerTelefon = hasText(truck.telefon_fahrer)
    ? `Tel: ${truck.telefon_fahrer}`
    : "";
  const fahrLines = [
    fahrerName,
    fahrerTelefon,
  ].filter(Boolean);

  const fraechterName = hasText(truck.fraechter?.name)
    ? truck.fraechter?.name ?? "–"
    : "–";
  const fraechterNummer = hasText(truck.fraechter?.kundennummer)
    ? `Kd-Nr: ${truck.fraechter?.kundennummer ?? ""}`
    : "";
  const fraechterLines = [
    fraechterName,
    fraechterNummer,
  ].filter(Boolean);

  const fmtKg =
    totalGewicht >= 1000
      ? `${(totalGewicht / 1000).toFixed(1)} t`
      : `${totalGewicht} kg`;
  const totalStr = `Gewicht: ${fmtKg}    |    Stück: ${totalAnzahl}    |    Lademeter: ${totalLdm} ldm`;

  // Rectangle borders need empty-string inputs
  const borderInputs: Record<string, string> = {};
  for (const key of [
    "b_title", "b_1", "b_cmr", "b_2", "b_16", "b_3", "b_veh",
    "b_4", "b_drv", "b_goods", "b_totals", "b_instr", "b_place",
    "b_date", "b_sig1", "b_sig2", "b_sig3",
  ]) {
    borderInputs[key] = "";
  }

  return {
    ...borderInputs,

    title: "CMR – Frachtbrief",
    subtitle:
      "Internationaler Frachtbrief / Convention relative au contrat de transport international de Marchandises par Route",

    label_1: "1  Absender (Sender)",
    absender: absenderText,

    label_2: "2  Empfänger (Consignee)",
    empfaenger: empfaengerText,

    label_3: "3  Auslieferungsort (Place of delivery)",
    auslieferungsort: entladeOrte.length > 0 ? entladeOrte.join("\n") : "–",

    label_4: "4  Übernahmeort und -datum (Place/date of taking over)",
    uebernahmeort: `${ladeOrte.length > 0 ? ladeOrte[0] : "–"}\n${truck.ladedatum}${hasText(truck.ladezeit) ? ` ${truck.ladezeit}` : ""}`,

    label_cmr_nr: "CMR Nr.",
    cmr_nr: hasText(truck.interne_ref)
      ? truck.interne_ref
      : hasText(truck.kunden_ref)
        ? truck.kunden_ref
        : "–",

    label_datum: "Datum",
    datum: dateStr,

    label_16: "16  Frächter (Carrier)",
    fraechter: fraechterLines.join("\n"),

    label_fahrzeug: "Fahrzeug (Vehicle)",
    fahrzeug: `${truck.kennzeichen}\nRef: ${truck.interne_ref}${hasText(truck.kunden_ref) ? `\nKd-Ref: ${truck.kunden_ref}` : ""}`,

    label_fahrer: "Fahrer (Driver)",
    fahrer_info: fahrLines.join("\n"),

    label_6:
      "6  Warenbezeichnung / Art der Verpackung (Description of goods)",
    goods_header:
      "Referenz                    Ladeort → Entladeort            |  Menge              |  Gewicht          |  Lademeter",
    goods_data: goodsLines.length > 0 ? goodsLines.join("\n") : "Keine Sendungen",

    label_totals: "Gesamt",
    totals: totalStr,

    label_13: "13  Besondere Vereinbarungen (Special agreements)",
    anweisungen: "",

    label_ausstellung: "21  Ausgestellt in (Established in)",
    ausstellungsort: ladeOrte.length > 0 ? ladeOrte[0] : "–",
    label_ausstellungsdatum: "Datum (Date)",
    ausstellungsdatum: dateStr,

    label_sig_absender: "22  Unterschrift Absender",
    label_sig_fraechter: "23  Unterschrift Frächter",
    label_sig_empfaenger: "24  Unterschrift Empfänger",
  };
}

/* ── Generate CMR PDF ─────────────────────────────────────────────── */

export async function generateCmrPdf(truck: Truck, sendungen: SendungRow[]) {
  const inputs = [buildCmrInputs(truck, sendungen)];
  const pdf = await generate({ template: cmrTemplate, inputs, plugins });
  const blob = new Blob([pdf.buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url);
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
