import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function LegalLibrary() {
  const [search, setSearch] = useState("");

  const laws = {
    civil: [
      { id: 1, title: "القانون المدني العراقي", articles: 1435, year: 1951 },
      { id: 2, title: "قانون الملكية العقارية", articles: 156, year: 2007 },
    ],
    criminal: [
      { id: 3, title: "قانون العقوبات العراقي", articles: 434, year: 1969 },
      { id: 4, title: "قانون الإجراءات الجنائية", articles: 300, year: 1971 },
    ],
    personal: [
      { id: 5, title: "قانون الأحوال الشخصية", articles: 188, year: 1959 },
      { id: 6, title: "قانون الزواج والطلاق", articles: 95, year: 2019 },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-accent">المكتبة القانونية العراقية</h1>

      <div className="flex gap-2 mb-6">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input placeholder="ابحث في القوانين..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="civil" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="civil">القانون المدني</TabsTrigger>
          <TabsTrigger value="criminal">القانون الجنائي</TabsTrigger>
          <TabsTrigger value="personal">الأحوال الشخصية</TabsTrigger>
        </TabsList>

        {Object.entries(laws).map(([key, items]) => (
          <TabsContent key={key} value={key}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map(law => (
                <Card key={law.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{law.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">عدد المواد: {law.articles}</p>
                    <p className="text-sm text-muted-foreground">السنة: {law.year}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
