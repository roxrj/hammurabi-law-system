import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Download, Trash2 } from "lucide-react";

export default function DocumentsManagement() {
  const documents = [
    { id: 1, title: "عقد الأتعاب", category: "عقد_أتعاب", date: "2026-01-15", size: "245 KB" },
    { id: 2, title: "مراسلة المحكمة", category: "مراسلات", date: "2026-01-10", size: "128 KB" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent">إدارة المستندات</h1>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 ml-2" />
          رفع مستند
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المستندات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحجم</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell><span className="px-2 py-1 bg-accent/20 text-accent rounded text-sm">{doc.category}</span></TableCell>
                  <TableCell>{doc.date}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
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
