import React from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
} from "../components/ui/ui";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">EcoBook Loop</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, User</span>
          <Button variant="outline" className="text-sm px-3 py-1">Logout</Button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex flex-row justify-between gap-4 px-6 pb-12 overflow-x-auto">
        {/* Books List */}
        <Card className="shadow">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-1">Books List</h2>
            <p className="text-sm text-gray-600 mb-4">Search and manage available books</p>
            <Button className="bg-gray-900 text-white">View Books</Button>
          </CardContent>
        </Card>

        {/* Recyclable Materials */}
        <Card className="shadow">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-1">Recyclable Materials</h2>
            <p className="text-sm text-gray-600 mb-4">List and track recyclable materials</p>
            <Button className="bg-gray-900 text-white">List Materials</Button>
          </CardContent>
        </Card>

        {/* Requests & Matches */}
        <Card className="shadow">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-1">Requests & Matches</h2>
            <p className="text-sm text-gray-600 mb-4">Match books to donation requests</p>
            <Button className="bg-gray-900 text-white">Find Matches</Button>
          </CardContent>
        </Card>

        {/* Pickup & Delivery */}
        <Card className="shadow">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-1">Pickup & Delivery</h2>
            <p className="text-sm text-gray-600 mb-4">Schedule pickup and delivery</p>
            <Button className="bg-gray-900 text-white">Schedule</Button>
          </CardContent>
        </Card>

        {/* Bonuses & Incentives (full-width on bottom row) */}
        <div className="md:col-span-2">
          <Card className="shadow">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-1">Bonuses & Incentives</h2>
              <p className="text-sm text-gray-600 mb-4">View rewards and redeem points</p>
              <Button className="bg-gray-900 text-white">View Rewards</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
