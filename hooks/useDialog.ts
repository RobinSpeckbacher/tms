"use client";

import { useState, useCallback } from "react";

export interface DialogState<T = undefined> {
  open: boolean;
  data: T | null;
}

export interface UseDialogReturn<T = undefined> {
  open: boolean;
  data: T | null;
  onOpen: (data?: T) => void;
  onClose: () => void;
}

export function useDialog<T = undefined>(): UseDialogReturn<T> {
  const [state, setState] = useState<DialogState<T>>({
    open: false,
    data: null,
  });

  const onOpen = useCallback((data?: T) => {
    setState({ open: true, data: data ?? null });
  }, []);

  const onClose = useCallback(() => {
    setState({ open: false, data: null });
  }, []);

  return { open: state.open, data: state.data, onOpen, onClose };
}
