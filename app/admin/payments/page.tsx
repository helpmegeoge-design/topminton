"use client";

import React from "react";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  RefreshCw,
  Bot,
} from "lucide-react";
import Image from "next/image";

interface PaymentSlip {
  id: string;
  slip_image_url: string;
  amount: number;
  payer_name: string;
  payment_date: string;
  bank_name: string;
  reference_number: string;
  ai_verified: boolean;
  ai_confidence: number;
  ai_extracted_data: any;
  status: string;
  created_at: string;
  party_member?: {
    user?: {
      display_name: string;
    };
    party?: {
      title: string;
    };
  };
}

export default function AdminPaymentsPage() {
  const [slips, setSlips] = useState<PaymentSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<PaymentSlip | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchSlips = async (status?: string) => {
    setLoading(true);
    const supabase = createClient();

    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("payment_slips")
        .select(
          `
          *,
          party_member:party_members(
            user:profiles(display_name),
            party:parties(title)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error("Error fetching slips:", error);
      } else {
        setSlips(data || []);
      }
    } catch (error) {
      console.error("Error fetching slips:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlips("pending");
  }, []);

  const handleVerify = async (slipId: string, approved: boolean) => {
    setProcessing(true);
    const supabase = createClient();

    const updateData: any = {
      status: approved ? "verified" : "rejected",
      manual_verified: true,
      verified_at: new Date().toISOString(),
    };

    if (!approved && rejectReason) {
      updateData.rejection_reason = rejectReason;
    }

    const { error } = await supabase
      .from("payment_slips")
      .update(updateData)
      .eq("id", slipId);

    if (error) {
      console.error("Error updating slip:", error);
    } else {
      setSelectedSlip(null);
      setRejectReason("");
      fetchSlips("pending");
    }
    setProcessing(false);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700",
    verified: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    verified: <CheckCircle className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ตรวจสอบการชำระเงิน
          </h1>
          <p className="text-muted-foreground">ยืนยันสลิปการโอนเงิน</p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchSlips("pending")}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          รีเฟรช
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" onValueChange={(v) => fetchSlips(v)}>
        <TabsList>
          <TabsTrigger value="pending">รอตรวจสอบ</TabsTrigger>
          <TabsTrigger value="verified">ยืนยันแล้ว</TabsTrigger>
          <TabsTrigger value="rejected">ปฏิเสธ</TabsTrigger>
          <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <SlipList
            slips={slips.filter((s) => s.status === "pending")}
            loading={loading}
            onView={setSelectedSlip}
            statusColors={statusColors}
            statusIcons={statusIcons}
          />
        </TabsContent>

        <TabsContent value="verified" className="mt-4">
          <SlipList
            slips={slips.filter((s) => s.status === "verified")}
            loading={loading}
            onView={setSelectedSlip}
            statusColors={statusColors}
            statusIcons={statusIcons}
          />
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <SlipList
            slips={slips.filter((s) => s.status === "rejected")}
            loading={loading}
            onView={setSelectedSlip}
            statusColors={statusColors}
            statusIcons={statusIcons}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <SlipList
            slips={slips}
            loading={loading}
            onView={setSelectedSlip}
            statusColors={statusColors}
            statusIcons={statusIcons}
          />
        </TabsContent>
      </Tabs>

      {/* Slip Detail Dialog */}
      <Dialog open={!!selectedSlip} onOpenChange={() => setSelectedSlip(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดสลิป</DialogTitle>
          </DialogHeader>

          {selectedSlip && (
            <div className="space-y-4">
              {/* Slip Image */}
              <div className="relative aspect-[3/4] max-h-80 bg-muted rounded-lg overflow-hidden">
                {selectedSlip.slip_image_url ? (
                  <Image
                    src={selectedSlip.slip_image_url || "/placeholder.svg"}
                    alt="Payment slip"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* AI Extracted Data */}
              {selectedSlip.ai_extracted_data && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                      <Bot className="h-4 w-4" />
                      AI วิเคราะห์ (ความมั่นใจ{" "}
                      {Math.round((selectedSlip.ai_confidence || 0) * 100)}%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-blue-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-blue-600">จำนวนเงิน:</span>{" "}
                        {selectedSlip.ai_extracted_data.amount || "-"} บาท
                      </div>
                      <div>
                        <span className="text-blue-600">ธนาคาร:</span>{" "}
                        {selectedSlip.ai_extracted_data.bank || "-"}
                      </div>
                      <div>
                        <span className="text-blue-600">วันที่:</span>{" "}
                        {selectedSlip.ai_extracted_data.date || "-"}
                      </div>
                      <div>
                        <span className="text-blue-600">เวลา:</span>{" "}
                        {selectedSlip.ai_extracted_data.time || "-"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ผู้ชำระ:</span>
                  <p className="font-medium">
                    {selectedSlip.party_member?.user?.display_name || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">ก๊วน:</span>
                  <p className="font-medium">
                    {selectedSlip.party_member?.party?.title || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">จำนวนเงิน:</span>
                  <p className="font-medium">{selectedSlip.amount || "-"} บาท</p>
                </div>
                <div>
                  <span className="text-muted-foreground">สถานะ:</span>
                  <Badge className={`${statusColors[selectedSlip.status]} ml-2`}>
                    {statusIcons[selectedSlip.status]}
                    <span className="ml-1">
                      {selectedSlip.status === "pending"
                        ? "รอตรวจสอบ"
                        : selectedSlip.status === "verified"
                          ? "ยืนยันแล้ว"
                          : "ปฏิเสธ"}
                    </span>
                  </Badge>
                </div>
              </div>

              {/* Reject Reason Input */}
              {selectedSlip.status === "pending" && (
                <div>
                  <label className="text-sm font-medium">
                    เหตุผลในการปฏิเสธ (ถ้ามี)
                  </label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="ระบุเหตุผล..."
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedSlip?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleVerify(selectedSlip.id, false)}
                  disabled={processing}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  ปฏิเสธ
                </Button>
                <Button
                  onClick={() => handleVerify(selectedSlip.id, true)}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  ยืนยัน
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SlipList({
  slips,
  loading,
  onView,
  statusColors,
  statusIcons,
}: {
  slips: PaymentSlip[];
  loading: boolean;
  onView: (slip: PaymentSlip) => void;
  statusColors: Record<string, string>;
  statusIcons: Record<string, React.ReactNode>;
}) {
  if (loading) {
    return (
      <Card className="puffy-card">
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin" />
          <p className="text-muted-foreground mt-2">กำลังโหลด...</p>
        </CardContent>
      </Card>
    );
  }

  if (slips.length === 0) {
    return (
      <Card className="puffy-card">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <p className="text-muted-foreground">ไม่มีรายการ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="puffy-card">
      <CardContent className="p-4">
        <div className="space-y-3">
          {slips.map((slip) => (
            <div
              key={slip.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onView(slip)}
            >
              <div className="w-12 h-16 bg-muted rounded-lg overflow-hidden relative flex-shrink-0">
                {slip.slip_image_url ? (
                  <Image
                    src={slip.slip_image_url || "/placeholder.svg"}
                    alt="Slip"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {slip.party_member?.user?.display_name || "Unknown"}
                  </p>
                  <Badge className={statusColors[slip.status]}>
                    {statusIcons[slip.status]}
                    <span className="ml-1">
                      {slip.status === "pending"
                        ? "รอ"
                        : slip.status === "verified"
                          ? "ยืนยัน"
                          : "ปฏิเสธ"}
                    </span>
                  </Badge>
                  {slip.ai_verified && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      <Bot className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {slip.party_member?.party?.title || "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(slip.created_at).toLocaleString("th-TH")}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium text-primary">
                  {slip.amount ? `${slip.amount} บาท` : "-"}
                </p>
                <Button variant="ghost" size="sm" className="mt-1">
                  <Eye className="h-4 w-4 mr-1" />
                  ดู
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
