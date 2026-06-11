import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Zap } from "lucide-react";

export default function CasesManagement() {
  const cases = [
    { id: 1, title: "قضية عقارية", client: "أحمد محمد", status: "جارية", court: "محكمة بغداد" },
    { id: 2, title: "قضية عمل", client: "فاطمة علي", status: "معلقة", court: "محكمة الكرخ" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-accent">إدارة القضايا</h1>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="w-4 h-4 ml-2" />
          قضية جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>القضايا النشطة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>الموكل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المحكمة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.client}</TableCell>
                  <TableCell><span className="px-2 py-1 bg-accent/20 text-accent rounded">{c.status}</span></TableCell>
                  <TableCell>{c.court}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-accent">
                        <Zap className="w-4 h-4" />
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
