"use client";

import React, { useState, useEffect } from "react";
import TimeChart from "@/components/analytics/AnalyticsBarChart";

const AnalyticsPage = () => {
    return (
        <div className="flex items-center justify-center">
            <TimeChart />
        </div>
    );
}

export default AnalyticsPage;

