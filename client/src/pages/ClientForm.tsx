import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useLocation } from "wouter";

export default function ClientForm() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/clients");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-accent mb-6">إضافة موكل جديد</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>بيانات الموكل</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>الاسم الكامل</Label>
              <Input placeholder="أدخل اسم الموكل" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input type="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input placeholder="رقم الهاتف" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <div>
              <Label>العنوان</Label>
              <Textarea placeholder="عنوان الموكل" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">حفظ</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/clients")}>إلغاء</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
