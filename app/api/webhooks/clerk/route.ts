import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createAdminClient } from "@/lib/supabase/server";

type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string; id: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
};

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not set" },
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
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;
    const primaryEmail = email_addresses[0]?.email_address ?? null;

    const { error } = await supabase.from("users").insert({
      id,
      email: primaryEmail,
      first_name,
      last_name,
      avatar_url: image_url,
    });

    if (error) {
      console.error("Failed to insert user:", JSON.stringify(error));
      return NextResponse.json({ error }, { status: 500 });
    }
  }

  if (event.type === "user.deleted") {
    const { id } = event.data;
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete user:", JSON.stringify(error));
      return NextResponse.json({ error }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
