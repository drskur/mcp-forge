import { Component, Setter } from "solid-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  setOpen: Setter<boolean>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
}

export const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
  const handleConfirm = () => {
    props.onConfirm();
    props.setOpen(false);
  };

  return (
    <AlertDialog open={props.open} onOpenChange={props.setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>{props.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose>{props.cancelText || "Cancel"}</AlertDialogClose>
          <AlertDialogAction
            class={buttonVariants({ 
              variant: props.variant === "destructive" ? "destructive" : "default" 
            })}
            onClick={handleConfirm}
          >
            {props.confirmText || "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};