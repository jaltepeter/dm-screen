import ConfirmDialog from './confirmDialog';

interface Props<T> {
  target: T | null;
  title: string;
  getDescription?: (item: T) => string;
  onConfirm: (item: T) => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog<T>({
  target,
  title,
  getDescription,
  onConfirm,
  onCancel
}: Props<T>) {
  return (
    <ConfirmDialog
      open={target !== null}
      title={title}
      description={target !== null && getDescription ? getDescription(target) : undefined}
      onConfirm={() => {
        if (target !== null) {
          onConfirm(target);
          onCancel();
        }
      }}
      onCancel={onCancel}
    />
  );
}
