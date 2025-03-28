import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="mt-auto py-2">
      <div className="container flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground"></p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Learn More about capture
          </Button>
          <Button variant="outline" size="sm">
            Learn more about processing
          </Button>
          <Button variant="outline" size="sm">
            Contact Us
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
