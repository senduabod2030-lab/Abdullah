// يُعاد تركيبه عند كل تنقل فيعطي حركة دخول ناعمة للصفحة
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-up">{children}</div>;
}
