"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Autocomplete from "@mui/joy/Autocomplete";
import AutocompleteOption from "@mui/joy/AutocompleteOption";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Textarea from "@mui/joy/Textarea";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import CircularProgress from "@mui/joy/CircularProgress";

import SlideOver from "@/components/common/SlideOver";
import PlzOrtInput from "@/components/common/PlzOrtInput";
import {
  useUnternehmenSearch,
  useCreateUnternehmen,
  type Unternehmen,
} from "@/hooks/useUnternehmen";

interface UnternehmenAutocompleteProps {
  /** Filter by role, e.g. "fraechter" or "kunde" */
  rolle?: string;
  /** Currently selected company */
  value: Unternehmen | null;
  /** Called when user selects a company */
  onChange: (value: Unternehmen | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Default roles when creating a new company */
  defaultRollen?: string[];
}

export default function UnternehmenAutocomplete({
  rolle,
  value,
  onChange,
  placeholder = "Name oder Kundennr. eingeben…",
  defaultRollen = ["kunde"],
}: UnternehmenAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: options = [], isLoading } = useUnternehmenSearch(
    inputValue,
    rolle,
  );
  const createMutation = useCreateUnternehmen();

  // ── Inline create form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTelefon, setNewTelefon] = useState("");
  const [newAnsprechpartner, setNewAnsprechpartner] = useState("");
  const [newAdresse, setNewAdresse] = useState("");
  const [newPlz, setNewPlz] = useState("");
  const [newOrt, setNewOrt] = useState("");
  const [newLand, setNewLand] = useState("");
  const [newNotizen, setNewNotizen] = useState("");

  const resetCreateForm = () => {
    setNewName("");
    setNewEmail("");
    setNewTelefon("");
    setNewAnsprechpartner("");
    setNewAdresse("");
    setNewPlz("");
    setNewOrt("");
    setNewLand("");
    setNewNotizen("");
  };

  const handleCreate = async () => {
    if (
      !newName.trim() ||
      !newAdresse.trim() ||
      !newPlz.trim() ||
      !newOrt.trim() ||
      !newLand.trim()
    )
      return;
    const created = await createMutation.mutateAsync({
      name: newName.trim(),
      rollen: defaultRollen,
      email: newEmail.trim() || undefined,
      telefon: newTelefon.trim() || undefined,
      ansprechpartner: newAnsprechpartner.trim() || undefined,
      adresse: newAdresse.trim(),
      plz: newPlz.trim(),
      ort: newOrt.trim(),
      land: newLand.trim(),
      notizen: newNotizen.trim() || undefined,
    });
    onChange(created);
    resetCreateForm();
    setShowCreate(false);
  };

  const inputSx = {
    "--Input-focusedHighlight": "#155dfc",
    color: "#0f172b",
  } as const;

  return (
    <>
      <Stack direction="row" spacing={0.5} alignItems="flex-start">
        <Autocomplete
          size="sm"
          placeholder={placeholder}
          inputValue={inputValue}
          onInputChange={(_e, val) => setInputValue(val)}
          value={value}
          onChange={(_e, val) => onChange(val)}
          options={options}
          getOptionLabel={(o) => `${o.name} (${o.kundennummer})`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          loading={isLoading}
          filterOptions={(x) => x} // server-side filtering
          noOptionsText={
            inputValue.length < 2 ? "Mind. 2 Zeichen…" : "Keine Treffer"
          }
          endDecorator={
            isLoading ? <CircularProgress size="sm" sx={{ mr: 0.5 }} /> : null
          }
          renderOption={(props, option) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { key, ...rest } = props as typeof props & { key: string };
            return (
              <AutocompleteOption key={option.id} {...rest}>
                <Box>
                  <Typography level="body-sm" sx={{ fontWeight: 500 }}>
                    {option.name}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: "#57688e" }}>
                    {option.kundennummer}
                    {option.ort ? ` · ${option.ort}` : ""}
                  </Typography>
                </Box>
              </AutocompleteOption>
            );
          }}
          sx={{
            flex: 1,
            "--Input-focusedHighlight": "#155dfc",
          }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          onClick={() => {
            setNewName(inputValue);
            setShowCreate(true);
          }}
          sx={{ color: "#57688e", borderColor: "#d5dbe8", flexShrink: 0 }}
        >
          <Plus className="h-3.5 w-3.5" />
        </IconButton>
      </Stack>

      {/* ── Create Unternehmen SlideOver ─────────────────────── */}
      <SlideOver
        open={showCreate}
        onClose={() => {
          resetCreateForm();
          setShowCreate(false);
        }}
        title="Neues Unternehmen"
        actions={
          <>
            <Button
              variant="plain"
              color="neutral"
              size="sm"
              onClick={() => {
                resetCreateForm();
                setShowCreate(false);
              }}
              sx={{ color: "#57688e" }}
            >
              Abbrechen
            </Button>
            <Button
              size="sm"
              loading={createMutation.isPending}
              onClick={() => {
                void handleCreate();
              }}
              sx={{ bgcolor: "#155dfc", "&:hover": { bgcolor: "#1250d4" } }}
            >
              Erstellen
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <Box>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Firmenname *
            </Typography>
            <Input
              autoFocus
              size="sm"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="z.B. Müller GmbH"
              sx={inputSx}
            />
          </Box>

          <Box>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Ansprechpartner
            </Typography>
            <Input
              size="sm"
              value={newAnsprechpartner}
              onChange={(e) => setNewAnsprechpartner(e.target.value)}
              placeholder="Vor- & Nachname"
              sx={inputSx}
            />
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Box sx={{ flex: 1 }}>
              <Typography
                level="body-xs"
                sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
              >
                E-Mail
              </Typography>
              <Input
                size="sm"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="info@firma.at"
                sx={inputSx}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                level="body-xs"
                sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
              >
                Telefon
              </Typography>
              <Input
                size="sm"
                type="tel"
                value={newTelefon}
                onChange={(e) => setNewTelefon(e.target.value)}
                placeholder="+43 …"
                sx={inputSx}
              />
            </Box>
          </Stack>

          <Box>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Adresse *
            </Typography>
            <Input
              size="sm"
              required
              value={newAdresse}
              onChange={(e) => setNewAdresse(e.target.value)}
              placeholder="Straße + Hausnummer"
              sx={inputSx}
            />
          </Box>

          <PlzOrtInput
            plz={newPlz}
            ort={newOrt}
            land={newLand}
            onPlzChange={setNewPlz}
            onOrtChange={setNewOrt}
            onLandChange={setNewLand}
            required
          />

          <Box>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Notizen
            </Typography>
            <Textarea
              size="sm"
              minRows={2}
              maxRows={4}
              value={newNotizen}
              onChange={(e) => setNewNotizen(e.target.value)}
              placeholder="Interne Bemerkungen…"
              sx={{
                "--Textarea-focusedHighlight": "#155dfc",
                color: "#0f172b",
              }}
            />
          </Box>
        </Stack>
      </SlideOver>
    </>
  );
}
