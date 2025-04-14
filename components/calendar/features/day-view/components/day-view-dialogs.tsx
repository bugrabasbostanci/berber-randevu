import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DayViewDialogsProps {
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  confirmDelete: () => void
  closeDayDialogOpen: boolean
  setCloseDayDialogOpen: (open: boolean) => void
  confirmCloseDay: () => void
}

export const DayViewDialogs = ({
  deleteDialogOpen,
  setDeleteDialogOpen,
  confirmDelete,
  closeDayDialogOpen,
  setCloseDayDialogOpen,
  confirmCloseDay
}: DayViewDialogsProps) => {
  return (
    <>
      <AlertDialog open={closeDayDialogOpen} onOpenChange={setCloseDayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Günü Kapat</AlertDialogTitle>
            <AlertDialogDescription>
              Bu günü kapatmak istediğinizden emin misiniz? Bu işlem tüm zaman dilimlerini kapatacak ve randevu alınmasını engelleyecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCloseDay}>Kapat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Randevuyu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 