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
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Lock, Trash2 } from "lucide-react"

interface DayViewDialogsProps {
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  confirmDelete: () => void
  closeDayDialogOpen: boolean
  setCloseDayDialogOpen: (open: boolean) => void
  confirmCloseDay: () => void
  closeDayReason: string
  setCloseDayReason: (reason: string) => void
  closeSlotDialogOpen: boolean
  setCloseSlotDialogOpen: (open: boolean) => void
  closeSlotReason: string
  setCloseSlotReason: (reason: string) => void
  confirmCloseTimeSlot: () => void
}

export function DayViewDialogs({
  deleteDialogOpen,
  setDeleteDialogOpen,
  confirmDelete,
  closeDayDialogOpen,
  setCloseDayDialogOpen,
  confirmCloseDay,
  closeDayReason,
  setCloseDayReason,
  closeSlotDialogOpen,
  setCloseSlotDialogOpen,
  closeSlotReason,
  setCloseSlotReason,
  confirmCloseTimeSlot
}: DayViewDialogsProps) {
  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Randevu Silme</AlertDialogTitle>
            <AlertDialogDescription>
              Bu randevuyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Randevuyu Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={closeDayDialogOpen} onOpenChange={setCloseDayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Günü Kapat</AlertDialogTitle>
            <AlertDialogDescription>
              Seçili günü tamamen kapatmak istediğinize emin misiniz?
              Tüm boş zaman dilimleri kapatılacak ve yeni randevu alınamayacak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="closeDayReason">Kapatma Nedeni</Label>
              <Textarea
                id="closeDayReason"
                placeholder="Örn: Tatil, özel gün, resmi tatil vb."
                value={closeDayReason}
                onChange={(e) => setCloseDayReason(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground">
                Bu neden, herkes tarafından görülebilecektir.
              </p>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCloseDay} className="bg-red-600 hover:bg-red-700">
              <Lock className="w-4 h-4 mr-2" />
              Günü Kapat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Zaman Dilimi Kapatma Dialog */}
      <Dialog open={closeSlotDialogOpen} onOpenChange={setCloseSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zaman Dilimini Kapat</DialogTitle>
            <DialogDescription>
              Bu zaman dilimini kapatmak için bir neden belirtebilirsiniz. Bu neden, herkes tarafından görülebilecektir.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="closeReason">Kapatma Nedeni</Label>
              <Textarea
                id="closeReason"
                placeholder="Örn: İzin, mola, bakım vb."
                value={closeSlotReason}
                onChange={(e) => setCloseSlotReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseSlotDialogOpen(false)}>
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmCloseTimeSlot}
              className="bg-red-600 hover:bg-red-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Zaman Dilimini Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 