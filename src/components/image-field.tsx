"use client";

import { useRef, useState } from "react";
import { ImageOff, Trash2, Upload } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { imageSrc } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

/**
 * Campo de imagem: envio de arquivo, endereço manual, miniatura e remoção.
 * O valor é sempre texto (endereço da imagem); vazio = sem imagem.
 */
export function ImageField({
  value,
  onChange,
  id,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  id?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!TYPES.includes(file.type)) {
      setError("Formato não aceito. Use PNG, JPEG, WEBP, SVG ou GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("A imagem tem mais de 10 MB. Reduza o tamanho e tente de novo.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.upload<{ url: string }>("/cms/admin/uploads", form);
      setBroken(false);
      onChange(res.url);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `Não foi possível enviar a imagem: ${e.message}`
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const src = imageSrc(value);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
          {src && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt="Miniatura"
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
              onLoad={() => setBroken(false)}
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-[10px] text-muted-foreground">
              <ImageOff className="h-5 w-5" />
              {src ? "Não carregou" : "Sem imagem"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            id={id}
            value={value}
            disabled={disabled}
            placeholder="Cole o endereço da imagem (https://… ou /arquivo.png)"
            onChange={(e) => {
              setBroken(false);
              onChange(e.target.value);
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={TYPES.join(",")}
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              {uploading ? "Enviando…" : "Enviar imagem"}
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled || uploading}
                onClick={() => {
                  setError(null);
                  onChange("");
                }}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remover
              </Button>
            )}
            <span className="text-[11px] text-muted-foreground">
              PNG, JPEG, WEBP, SVG ou GIF, até 10 MB.
            </span>
          </div>
        </div>
      </div>
      {broken && value && !error && (
        <p className="text-xs text-yellow-800">
          Não foi possível mostrar a miniatura. Confira o endereço (caminhos que
          começam com / são arquivos do próprio site).
        </p>
      )}
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
