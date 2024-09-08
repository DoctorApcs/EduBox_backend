import React from "react";
import { Card } from "@/components/ui/card"
import { ArrowUpRightIcon } from "lucide-react";


const KnowledgeBaseCard = ({ title, docCount, lastUpdated, onClick }) => {
  return (
    <Card className="relative rounded-3xl">
      <div className="absolute top-2 right-2 w-14 h-14 bg-custom-primary rounded-full flex items-center justify-center">
        <ArrowUpRightIcon className="w-10 h-10 text-white" />
      </div>
      <div
        className="w-full h-32 bg-cover bg-center"
        style={{ backgroundImage: "url('/placeholder.svg?height=128&width=128')" }}
      />
      <div className="p-4">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-gray-600">{docCount} Documents</p>
      </div>
    </Card>
  );
};

export default KnowledgeBaseCard;
