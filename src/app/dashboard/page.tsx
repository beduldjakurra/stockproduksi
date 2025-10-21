'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/production/Header';
import Footer from '@/components/production/Footer';
import TabNavigation from '@/components/production/TabNavigation';

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-blue-600">STO Dashboard</h1>
                    <Link href="/">
                        <Button variant="outline">Back to Home</Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-xl text-blue-600">
                            PT Fuji Seat Indonesia - Production Management
                        </CardTitle>
                        <CardDescription>
                            Sistem manajemen produksi dan stock untuk Divisi Injection
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Production Interface */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg">
                    <Header />
                    <div className="p-6">
                        <TabNavigation />
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;