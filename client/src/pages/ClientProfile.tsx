import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientProfile() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-accent">ملف الموكل</h1>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">المعلومات</TabsTrigger>
          <TabsTrigger value="cases">القضايا</TabsTrigger>
          <TabsTrigger value="documents">المستندات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الموكل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div><span className="font-bold">الاسم:</span> أحمد محمد</div>
                <div><span className="font-bold">البريد:</span> ahmed@example.com</div>
                <div><span className="font-bold">الهاتف:</span> +964791234567</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle>القضايا</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">لا توجد قضايا حالياً</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>المستندات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">لا توجد مستندات حالياً</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
