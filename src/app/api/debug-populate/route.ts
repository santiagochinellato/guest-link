import { NextResponse } from "next/server";
import { populateRecommendations } from "@/lib/actions/auto-populate";

export async function POST(request: Request) {
  const { propertyId, categoryId } = await request.json();
  
  console.log("\n🔥 === API ROUTE CALLED ===");
  console.log("Property ID:", propertyId);
  console.log("Category ID:", categoryId);
  
  const result = await populateRecommendations(propertyId, categoryId);
  
  console.log("Result:", result);
  console.log("🔥 === API ROUTE DONE ===\n");
  
  return NextResponse.json(result);
}
