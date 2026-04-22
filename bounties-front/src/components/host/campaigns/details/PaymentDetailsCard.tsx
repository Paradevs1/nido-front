import { FiUsers, FiDollarSign } from "react-icons/fi";
import { CampaignDetails } from "@/lib/api/host";
import Button from "@/components/ui/Button";
import { useState } from "react";
import dynamic from "next/dynamic";
const ActivateCampaignModal = dynamic(() => import("./ActivateCampaignModal"), { ssr: false });

interface PaymentDetailsCardProps {
  campaign: CampaignDetails;
}

export default function PaymentDetailsCard({ campaign }: PaymentDetailsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const now = new Date();
  const endDate = new Date(campaign.end_date);
  const isExpired = now > endDate;

  return (
    <>
      <div className="bg-[var(--color-card)] rounded-2xl p-6 h-full flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Payment</h2>
          
          <div className="border-b border-white/10 mb-6"></div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 uppercase tracking-wide">Total Prize</span>
              <span className="text-white font-bold flex items-center gap-2">
                <FiDollarSign className="text-[var(--color-primary)]" /> {campaign.total_prize_pool.toLocaleString()} <span className="uppercase">{campaign.payment_token}</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 uppercase tracking-wide">Distribution Type</span>
              <span className="text-white font-medium">Leaderboard</span>
            </div>
          </div>
        </div>

        <Button 
          variant="default"
          className={`w-full mt-8 px-5 py-2 text-[14px] font-bold ${isExpired ? 'cursor-not-allowed opacity-60 bg-opacity-80' : 'cursor-pointer'}`}
          onClick={() => !isExpired && setIsModalOpen(true)}
          disabled={isExpired}
        >
          {isExpired ? "EXPIRED CAMPAIGN" : "ACTIVE CAMPAIGN"}
        </Button>
      </div>

      <ActivateCampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        campaign={campaign} 
      />
    </>
  );
}
