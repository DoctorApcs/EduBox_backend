"use client";

import React, { useState, useEffect } from "react";
import AnalyticsBarChart from "@/components/analytics/AnalyticsBarChart";

const AnalyticsPage = () => {
    return (
        <div className="flex items-center justify-center">
            <AnalyticsBarChart />
        </div>
    );
}

export default AnalyticsPage;

