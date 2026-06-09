import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function ClientsList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const clients = [
    { id: 1, name: "أحمد محمد", phone: "+964791234567", email: "ahmed@example.com", cases: 3 },
    { id: 2, name: "فاطمة علي", phone: "+964792345678", email: "fatima@example.com", cases: 2 },
  ];

  const filtered = clients.filter(c => c.name.includes(searchTerm) || c.email.includes(searchTerm));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent">قائمة الموكلين</h1>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/clients/new")}>
          <Plus className="w-4 h-4 ml-2" />
          موكل جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input placeholder="ابحث عن موكل..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الموكلين ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>القضايا</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.cases}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/clients/${client.id}/edit`)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
