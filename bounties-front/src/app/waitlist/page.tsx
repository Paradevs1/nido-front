"use client";
import Image from "next/image";
import {
  HostHeroSection,
  HostPlansSection,
  HostContactForm,
} from "@/components/host";
import ImageSection from "../../components/form/ImageSection";
import WaitlistText from "../../components/form/WaitlistText";
import WaitlistForm from "@/components/form/WaitlistForm";

export default function WaitlistPage() {
  return (
    <div>
      <WaitlistText />
      <WaitlistForm />
    </div>
  );
}
