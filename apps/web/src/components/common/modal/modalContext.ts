import { createContext, useContext } from 'react';

export type BaseOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export type ConfirmOptions = BaseOptions;
export type AlertOptions = BaseOptions;
export type PromptOptions = BaseOptions & {
  defaultValue?: string;
  placeholder?: string;
};

export type ModalContextValue = {
  confirm(opts?: ConfirmOptions): Promise<boolean>;
  alert(opts: AlertOptions): Promise<void>;
  prompt(opts: PromptOptions): Promise<string | null>;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export const useModal = (): ModalContextValue => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within <ModalProvider>');
  return ctx;
};
