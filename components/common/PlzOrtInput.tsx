"use client";

import { useState } from "react";
import Autocomplete from "@mui/joy/Autocomplete";
import AutocompleteOption from "@mui/joy/AutocompleteOption";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import CircularProgress from "@mui/joy/CircularProgress";

import { usePlzLookup, type PlzEntry } from "@/hooks/usePlzLookup";

interface PlzOrtInputProps {
  plz: string;
  ort: string;
  land: string;
  onPlzChange: (plz: string) => void;
  onOrtChange: (ort: string) => void;
  onLandChange: (land: string) => void;
  required?: boolean;
}

/**
 * Reusable PLZ / Ort / Land row with autocomplete lookup.
 * When user types a PLZ, matching entries appear.
 * Selecting one auto-fills Ort + Land.
 */
export default function PlzOrtInput({
  plz,
  ort,
  land,
  onPlzChange,
  onOrtChange,
  onLandChange,
  required = false,
}: PlzOrtInputProps) {
  const [plzInput, setPlzInput] = useState(plz);
  const { data: suggestions = [], isLoading } = usePlzLookup(plzInput);

  const handleSelect = (_e: unknown, value: string | PlzEntry | null) => {
    if (value && typeof value !== "string") {
      onPlzChange(value.plz);
      onOrtChange(value.ort);
      onLandChange(value.land);
      setPlzInput(value.plz);
    }
  };

  const inputSx = {
    "--Input-focusedHighlight": "#155dfc",
    color: "#0f172b",
  } as const;

  return (
    <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
      <Box sx={{ width: 120, flexShrink: 0 }}>
        <Typography
          level="body-xs"
          sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
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
          onChange={handleSelect}
          options={suggestions}
          getOptionLabel={(o) =>
            typeof o === "string" ? o : `${o.plz} ${o.ort}`
          }
          isOptionEqualToValue={(a, b) =>
            typeof a !== "string" && typeof b !== "string" && a.id === b.id
          }
          loading={isLoading}
          filterOptions={(x) => x}
          noOptionsText={
            plzInput.length < 2 ? "Mind. 2 Ziffern…" : "Keine Treffer"
          }
          endDecorator={
            isLoading ? <CircularProgress size="sm" sx={{ mr: 0.5 }} /> : null
          }
          renderOption={(props, option) => {
            return (
              <AutocompleteOption {...props}>
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
          sx={{ "--Input-focusedHighlight": "#155dfc" }}
        />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          level="body-xs"
          sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
        >
          Ort {required && "*"}
        </Typography>
        <Input
          size="sm"
          required={required}
          value={ort}
          onChange={(e) => onOrtChange(e.target.value)}
          placeholder="Wien"
          sx={inputSx}
        />
      </Box>

      <Box sx={{ width: 60, flexShrink: 0 }}>
        <Typography
          level="body-xs"
          sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
        >
          Land {required && "*"}
        </Typography>
        <Input
          size="sm"
          required={required}
          value={land}
          onChange={(e) => onLandChange(e.target.value)}
          placeholder="AT"
          sx={inputSx}
        />
      </Box>
    </Stack>
  );
}
