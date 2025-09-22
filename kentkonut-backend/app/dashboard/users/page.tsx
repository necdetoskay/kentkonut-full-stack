"use client";

import { useState, useEffect } from "react";
import { useUsers, User } from "@/app/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserFormModal from "@/app/components/modals/UserFormModal";
import { LoadingSkeleton } from "@/components/ui/loading";
import { toast } from "sonner";

export default function UsersPage() {
  const { users, deleteUser, isLoading, error } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [mode, setMode] = useState<"add" | "edit">("add");

  // Silme onay penceresi için state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Kullanıcı verilerini konsola yazdır (hata ayıklama için)
  useEffect(() => {
    console.log("Kullanıcılar sayfasında kullanıcılar:", users);
    console.log("Yükleniyor:", isLoading);
    console.log("Hata:", error);
  }, [users, isLoading, error]);

  const handleAddUser = () => {
    setMode("add");
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setMode("edit");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Silme onay penceresini açar
  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  // Silinecek kullanıcının adını bul
  const getUserNameToDelete = () => {
    if (!userToDelete) return "";
    const user = users.find(u => u.id === userToDelete);
    return user ? (user.name || user.email) : "";
  };

  // Silme işlemini iptal eder
  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Silme işlemini onaylar ve gerçekleştirir
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete);
      toast.success("Kullanıcı başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Kullanıcı silinirken bir hata oluştu");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kullanıcılar</h2>
          <p className="text-muted-foreground">
            Sistem kullanıcılarını yönetin
          </p>
        </div>
        <Button onClick={handleAddUser}>Yeni Kullanıcı</Button>
      </div>      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p className="font-semibold">Hata:</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Lütfen sayfayı yenileyin veya yöneticinize başvurun.</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-muted p-8 text-center rounded-md">
          <p className="text-muted-foreground mb-4">Henüz hiç kullanıcı bulunmuyor.</p>
          <Button onClick={handleAddUser}>İlk Kullanıcıyı Ekle</Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "İsimsiz Kullanıcı"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? "Yönetici" : "Kullanıcı"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {user.emailVerified ? "Doğrulanmış" : "Doğrulanmamış"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      className="mr-2"
                      onClick={() => handleEditUser(user)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      Sil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        mode={mode}
      />

      {/* Silme Onay Penceresi */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelDelete();
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Sil</DialogTitle>
            <DialogDescription>
              <strong>{getUserNameToDelete()}</strong> adlı kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}