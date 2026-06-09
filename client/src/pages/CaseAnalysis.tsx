import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";

export default function CaseAnalysis() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        summary: "هذه قضية عقارية تتعلق بنزاع على ملكية عقار في بغداد",
        legalArticles: "المادة 123 من القانون المدني العراقي، المادة 45 من قانون العقار",
        defensStrategy: "يوصى بتقديم الوثائق الملكية والعقود الأصلية",
        risks: "احتمال تأخر الحكم، تكاليف قضائية إضافية",
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-accent">تحليل القضية بالذكاء الاصطناعي</h1>

      <Button 
        size="lg" 
        className="bg-accent text-accent-foreground hover:bg-accent/90 w-full"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Zap className="w-4 h-4 ml-2" />}
        {loading ? "جاري التحليل..." : "تحليل القضية"}
      </Button>

      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>الملخص القانوني</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{analysis.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المواد القانونية ذات الصلة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{analysis.legalArticles}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>استراتيجية الدفاع</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{analysis.defensStrategy}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المخاطر المحتملة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{analysis.risks}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
