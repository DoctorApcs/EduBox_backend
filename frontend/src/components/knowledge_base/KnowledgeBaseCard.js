import React from "react";
import { Card } from "@/components/ui/card"
import { ArrowUpRightIcon } from "lucide-react";

const KnowledgeBaseCard = ({ title, docCount, lastUpdated, onClick }) => {
return (
  <Card className="relative rounded-3xl overflow-hidden h-52 w-52 cursor-pointer shadow-lg transition-all duration-300 hover:z-10" onClick={onClick}>
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url('https://placehold.co/600x400')" }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
    <div className="absolute top-2 right-2 w-14 h-14 bg-custom-primary rounded-full flex items-center justify-center hover:bg-custom-cta">
        <ArrowUpRightIcon className="w-8 h-8 text-white" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
      <h4 className="font-semibold text-lg mb-1">{title}</h4>
      <p className="text-sm opacity-80">{docCount} Documents</p>
    </div>
  </Card>
);
};

export default KnowledgeBaseCard;
