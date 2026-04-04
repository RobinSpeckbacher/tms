import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createAdminClient } from "@/lib/supabase/server";

type ClerkEmailAddress = { email_address: string; id: string };

type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: ClerkEmailAddress[];
    primary_email_address_id: string | null;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
};

function getPrimaryEmail(
  emailAddresses: ClerkEmailAddress[],
  primaryEmailId: string | null
): string | null {
  if (primaryEmailId) {
    const primary = emailAddresses.find((e) => e.id === primaryEmailId);
    if (primary) return primary.email_address;
  }
  return emailAddresses[0]?.email_address ?? null;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  // Verify the Svix signature
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing Svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  if (event.type === "user.created") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name, image_url } =
      event.data;
    const email = getPrimaryEmail(email_addresses, primary_email_address_id);

    const { error } = await supabase.from("users").insert({
      id,
      email,
      first_name,
      last_name,
      avatar_url: image_url,
    });

    if (error) {
      console.error("Failed to insert user:", JSON.stringify(error));
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
  }

  if (event.type === "user.deleted") {
    const { id } = event.data;
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete user:", JSON.stringify(error));
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
