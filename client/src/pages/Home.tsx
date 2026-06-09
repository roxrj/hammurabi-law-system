import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Scale3D, FileText, Users, BarChart3 } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-accent mb-8">أهلاً وسهلاً، {user.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Users className="w-5 h-5" />
                  الموكلين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">24</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Scale3D className="w-5 h-5" />
                  القضايا
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">18</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <FileText className="w-5 h-5" />
                  المستندات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">156</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <BarChart3 className="w-5 h-5" />
                  الإحصائيات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">12</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="mb-8">
          <Scale3D className="w-20 h-20 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-accent mb-4">نظام حمورابي</h1>
          <p className="text-xl text-foreground mb-2">منصة إدارة مكاتب المحاماة العراقية</p>
          <p className="text-muted-foreground">نظام متكامل لإدارة الموكلين والقضايا والمستندات والتحليل الذكي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-accent/20">
            <CardHeader>
              <CardTitle className="text-accent">إدارة الموكلين</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">إضافة وتعديل وحذف الموكلين مع رفع صورهم</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-accent/20">
            <CardHeader>
              <CardTitle className="text-accent">إدارة القضايا</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">تتبع حالات القضايا والجلسات والأحكام</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-accent/20">
            <CardHeader>
              <CardTitle className="text-accent">المستندات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">رفع وتصنيف المستندات القانونية</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-accent/20">
            <CardHeader>
              <CardTitle className="text-accent">تحليل AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">تحليل ذكي للقضايا بالقانون العراقي</p>
            </CardContent>
          </Card>
        </div>

        <Button
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg"
          onClick={() => window.location.href = getLoginUrl()}
        >
          تسجيل الدخول
        </Button>
      </div>
    </div>
  );
}
