import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";

export default function ContractTemplates() {
  const templates = [
    { id: 1, name: "عقد الأتعاب", description: "عقد توكيل بين المحامي والموكل" },
    { id: 2, name: "عقد البيع", description: "عقد بيع عقار أو منقول" },
    { id: 3, name: "عقد الإيجار", description: "عقد إيجار عقار سكني أو تجاري" },
    { id: 4, name: "عقد الشراكة", description: "عقد شراكة بين شركاء" },
    { id: 5, name: "عقد القرض", description: "عقد قرض بفائدة أو بدون" },
    { id: 6, name: "عقد الوصية", description: "عقد وصية قانوني" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-accent">قوالب العقود الجاهزة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="hover:border-accent/50 transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
              <div className="flex gap-2">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1">
                  <Download className="w-4 h-4 ml-2" />
                  تحميل
                </Button>
                <Button size="sm" variant="outline" className="flex-1">طباعة</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
