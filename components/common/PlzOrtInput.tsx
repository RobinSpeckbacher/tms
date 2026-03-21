"use client";

import { useState, useEffect } from "react";
import Autocomplete from "@mui/joy/Autocomplete";
import AutocompleteOption from "@mui/joy/AutocompleteOption";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import CircularProgress from "@mui/joy/CircularProgress";

import { usePlzLookup, useOrtLookup, type PlzEntry } from "@/hooks/usePlzLookup";

interface PlzOrtInputProps {
  plz: string;
  ort: string;
  land: string;
  onPlzChange: (plz: string) => void;
  onOrtChange: (ort: string) => void;
  onLandChange: (land: string) => void;
  required?: boolean;
  error?: boolean;
}

/**
 * Reusable PLZ / Ort / Land row with autocomplete lookup.
 * PLZ and Ort both have autocomplete — selecting either auto-fills PLZ + Ort + Land.
 */
export default function PlzOrtInput({
  plz,
  ort,
  land,
  onPlzChange,
  onOrtChange,
  onLandChange,
  required = false,
  error = false,
}: PlzOrtInputProps) {
  const [plzInput, setPlzInput] = useState(plz);
  const [ortInput, setOrtInput] = useState(ort);

  // Sync internal state when parent props change (e.g. "Ladeort übernehmen")
  useEffect(() => { setPlzInput(plz); }, [plz]);
  useEffect(() => { setOrtInput(ort); }, [ort]);

  const { data: plzSuggestions = [], isLoading: plzLoading } = usePlzLookup(plzInput);
  const { data: ortSuggestions = [], isLoading: ortLoading } = useOrtLookup(ortInput);

  const handlePlzSelect = (_e: unknown, value: string | PlzEntry | null) => {
    if (value && typeof value !== "string") {
      onPlzChange(value.plz);
      onOrtChange(value.ort);
      onLandChange(value.land);
      setPlzInput(value.plz);
      setOrtInput(value.ort);
    }
  };

  const handleOrtSelect = (_e: unknown, value: string | PlzEntry | null) => {
    if (value && typeof value !== "string") {
      onPlzChange(value.plz);
      onOrtChange(value.ort);
      onLandChange(value.land);
      setPlzInput(value.plz);
      setOrtInput(value.ort);
    }
  };

  const inputSx = {
    "--Input-focusedHighlight": "#155dfc",
    color: "#0f172b",
  } as const;

  const errorInputSx = {
    "--Input-focusedHighlight": "#ef4444",
    borderColor: "#ef4444",
    color: "#0f172b",
  } as const;

  const plzError = error && !plz.trim();
  const ortError = error && !ort.trim();
  const landError = error && !land.trim();

  return (
    <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
      <Box sx={{ width: 120, flexShrink: 0 }}>
        <Typography
          level="body-xs"
          sx={{ color: plzError ? "#ef4444" : "#57688e", mb: 0.5, fontWeight: 500 }}
        >
          PLZ {required && "*"}
        </Typography>
        <Autocomplete
          size="sm"
          freeSolo
          placeholder="1010"
          inputValue={plzInput}
          onInputChange={(_e, val) => {
            setPlzInput(val);
            onPlzChange(val);
          }}
          value={null}
          onChange={handlePlzSelect}
          options={plzSuggestions}
          getOptionLabel={(o) =>
            typeof o === "string" ? o : `${o.plz} ${o.ort}`
          }
          isOptionEqualToValue={(a, b) =>
            typeof a !== "string" && typeof b !== "string" && a.id === b.id
          }
          loading={plzLoading}
          filterOptions={(x) => x}
          noOptionsText={
            plzInput.length < 2 ? "Mind. 2 Ziffern…" : "Keine Treffer"
          }
          endDecorator={
            plzLoading ? <CircularProgress size="sm" sx={{ mr: 0.5 }} /> : null
          }
          renderOption={(props, option) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { key, ...rest } = props as any;
            return (
              <AutocompleteOption key={key} {...rest}>
                <Typography level="body-sm" sx={{ fontWeight: 500 }}>
                  {typeof option !== "string" && option.plz}
                </Typography>
                &nbsp;
                <Typography level="body-xs" sx={{ color: "#57688e" }}>
                  {typeof option !== "string" &&
                    `${option.ort} (${option.land})`}
                </Typography>
              </AutocompleteOption>
            );
          }}
          sx={plzError ? { "--Input-focusedHighlight": "#ef4444", borderColor: "#ef4444" } : { "--Input-focusedHighlight": "#155dfc" }}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          level="body-xs"
          sx={{ color: ortError ? "#ef4444" : "#57688e", mb: 0.5, fontWeight: 500 }}
        >
          Ort {required && "*"}
        </Typography>
        <Autocomplete
          size="sm"
          freeSolo
          placeholder="Wien"
          inputValue={ortInput}
          onInputChange={(_e, val) => {
            setOrtInput(val);
            onOrtChange(val);
          }}
          value={null}
          onChange={handleOrtSelect}
          options={ortSuggestions}
          getOptionLabel={(o) =>
            typeof o === "string" ? o : `${o.ort} (${o.plz})`
          }
          isOptionEqualToValue={(a, b) =>
            typeof a !== "string" && typeof b !== "string" && a.id === b.id
          }
          loading={ortLoading}
          filterOptions={(x) => x}
          noOptionsText={
            ortInput.length < 2 ? "Mind. 2 Zeichen…" : "Keine Treffer"
          }
          endDecorator={
            ortLoading ? <CircularProgress size="sm" sx={{ mr: 0.5 }} /> : null
          }
          renderOption={(props, option) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { key, ...rest } = props as any;
            return (
              <AutocompleteOption key={key} {...rest}>
                <Typography level="body-sm" sx={{ fontWeight: 500 }}>
                  {typeof option !== "string" && option.ort}
                </Typography>
                &nbsp;
                <Typography level="body-xs" sx={{ color: "#57688e" }}>
                  {typeof option !== "string" &&
                    `${option.plz} (${option.land})`}
                </Typography>
              </AutocompleteOption>
            );
          }}
          sx={ortError ? { "--Input-focusedHighlight": "#ef4444", borderColor: "#ef4444" } : { "--Input-focusedHighlight": "#155dfc" }}
        />
      </Box>

      <Box sx={{ width: 60, flexShrink: 0 }}>
        <Typography
          level="body-xs"
          sx={{ color: landError ? "#ef4444" : "#57688e", mb: 0.5, fontWeight: 500 }}
        >
          Land {required && "*"}
        </Typography>
        <Input
          size="sm"
          required={required}
          value={land}
          onChange={(e) => onLandChange(e.target.value)}
          placeholder="AT"
          sx={landError ? errorInputSx : inputSx}
        />
      </Box>
    </Stack>
  );
}
