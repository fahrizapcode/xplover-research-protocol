import { PrismaClient, RoleName, TechnologyCategory, ContentStatus, ContentAngle, TargetAudience, VisualDesignStatus, AttestationStatus, XcrTransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Xplover Database Seeding...");

  // 1. Clear existing data in reverse order of dependencies
  await prisma.activityLog.deleteMany();
  await prisma.blockchainAttestation.deleteMany();
  await prisma.xcrTransaction.deleteMany();
  await prisma.visualDesign.deleteMany();
  await prisma.contentReview.deleteMany();
  await prisma.contentRevision.deleteMany();
  await prisma.contentSlide.deleteMany();
  await prisma.content.deleteMany();
  await prisma.researchRating.deleteMany();
  await prisma.research.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared old data.");

  // 2. Create Roles
  const roles = await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.create({
        data: { name },
      })
    )
  );
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));
  console.log(`✅ Created ${roles.length} system roles.`);

  // 3. Create Users
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const usersData = [
    {
      name: "Xplover Administrator",
      username: "admin",
      email: "admin@xplover.io",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      bio: "Chief Protocol Overseer & Governance Lead at Xplover Network.",
      roles: [RoleName.ADMIN, RoleName.RESEARCHER, RoleName.CONTENT_CREATOR, RoleName.PEER_REVIEWER, RoleName.VISUAL_DESIGNER],
      xcrBalance: 500,
    },
    {
      name: "Dr. Satoshi Nakamoto",
      username: "satoshi",
      email: "satoshi@xplover.io",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      bio: "Principal Cryptography & Distributed Systems Researcher.",
      roles: [RoleName.RESEARCHER],
      xcrBalance: 120,
    },
    {
      name: "Dr. Elena Rostova",
      username: "elena_ai",
      email: "elena@xplover.io",
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      bio: "AI & Neural Representation Scientist at Cambridge AI Lab.",
      roles: [RoleName.RESEARCHER],
      xcrBalance: 85,
    },
    {
      name: "Maya Lin",
      username: "maya_writer",
      email: "maya@xplover.io",
      walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      bio: "Web3 Technical Storyteller and Educational Carousel Architect.",
      roles: [RoleName.CONTENT_CREATOR],
      xcrBalance: 150,
    },
    {
      name: "Alex Chen",
      username: "alex_chen",
      email: "alex@xplover.io",
      walletAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      bio: "Tech Explainer, Systems Thinker & Visual Content Creator.",
      roles: [RoleName.CONTENT_CREATOR],
      xcrBalance: 75,
    },
    {
      name: "Prof. Marcus Brody",
      username: "rev_marcus",
      email: "marcus@xplover.io",
      walletAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
      bio: "Senior Academic Peer Reviewer specializing in consensus mechanisms.",
      roles: [RoleName.PEER_REVIEWER],
      xcrBalance: 90,
    },
    {
      name: "Dr. Sarah Connor",
      username: "rev_sarah",
      email: "sarah@xplover.io",
      walletAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
      bio: "Autonomous Systems and Security Auditor.",
      roles: [RoleName.PEER_REVIEWER],
      xcrBalance: 65,
    },
    {
      name: "Taro Tanaka",
      username: "rev_taro",
      email: "taro@xplover.io",
      walletAddress: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
      bio: "Formal Verification & Cryptographic Protocol Auditor.",
      roles: [RoleName.PEER_REVIEWER],
      xcrBalance: 55,
    },
    {
      name: "Dr. Amara Okafor",
      username: "rev_amara",
      email: "amara@xplover.io",
      walletAddress: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
      bio: "Distributed Ledger Scalability & Data Availability Researcher.",
      roles: [RoleName.PEER_REVIEWER],
      xcrBalance: 70,
    },
    {
      name: "Zack Snyder",
      username: "rev_zack",
      email: "zack@xplover.io",
      walletAddress: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
      bio: "Senior Technical Reviewer & Systems Engineer.",
      roles: [RoleName.PEER_REVIEWER],
      xcrBalance: 40,
    },
    {
      name: "Sofia Rossi",
      username: "sofia_designer",
      email: "sofia@xplover.io",
      walletAddress: "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
      bio: "Senior Web3 Brand & Visual Infographic Designer.",
      roles: [RoleName.VISUAL_DESIGNER],
      xcrBalance: 110,
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        username: u.username,
        email: u.email,
        passwordHash,
        walletAddress: u.walletAddress,
        bio: u.bio,
        xcrBalance: u.xcrBalance,
        roles: {
          create: u.roles.map((r) => ({
            roleId: roleMap.get(r)!,
          })),
        },
      },
    });
    createdUsers[u.username] = user;
  }
  console.log(`✅ Created ${Object.keys(createdUsers).length} test users with roles & wallets.`);

  // 4. Create Research Papers
  const researchPapers = [
    {
      title: "Decentralized Zero-Knowledge Proofs in High-Throughput Layer-2 Rollups",
      paperUrl: "https://arxiv.org/abs/2401.12345",
      publicationYear: 2024,
      technologyCategory: TechnologyCategory.WEB3,
      problem: "Current ZK-rollup provers are centralized, leading to single points of failure, potential censorship, and high proving costs that prevent decentralized sequencers from participating in validity proofs.",
      approach: "We introduce a novel decentralized proof marketplace with recursive STARK aggregation and sub-second dispute resolution over a decentralized network of GPU/FPGA proof nodes.",
      keyFindings: "Reduces validity proof verification latency by 74% on EVM targets while cutting prover gas overhead by 62% across 10,000 synthetic test transactions.",
      researcherInsight: "Decentralizing the prover network without sacrificial latency is the final milestone for trustless Ethereum scaling.",
      whyItMatters: "Allows anyone with standard workstation hardware to contribute computational proving power, earning protocol fees without central gatekeeping.",
      whatCommunityShouldLearn: "How recursive proof composition enables multi-prover aggregation without inflating verification costs on L1.",
      unclearParts: "Dynamic latency impacts under adverse network partitions across global geographic regions.",
      discussionQuestions: "Can staking slash penalties prevent collusion among Top-10 GPU proof clusters?",
      authorId: createdUsers["satoshi"].id,
    },
    {
      title: "Self-Supervised Multimodal Transformers for Autonomous Robotics Navigation in Unstructured Terrain",
      paperUrl: "https://arxiv.org/abs/2402.67890",
      publicationYear: 2024,
      technologyCategory: TechnologyCategory.ARTIFICIAL_INTELLIGENCE,
      problem: "Traditional SLAM fails in dynamic, dusty, or featureless outdoor environments like search-and-rescue ruins or off-road exploration due to sensor noise.",
      approach: "A unified transformer backbone integrating LiDAR point clouds, thermal imaging, and event-camera streams with self-supervised contrastive pretraining.",
      keyFindings: "Zero-shot transfer achieves a 94.2% navigation success rate across muddy, smoke-filled, and night terrains with zero manual human teleoperation.",
      researcherInsight: "Cross-modal attention between temporal event streams and spatial point clouds overcomes sensory blinding completely.",
      whyItMatters: "Critical for disaster relief, interplanetary rovers, and outdoor autonomous logistics fleets.",
      whatCommunityShouldLearn: "Why event cameras paired with contrastive transformers perform 10x faster than traditional frame-based cameras.",
      authorId: createdUsers["elena_ai"].id,
    },
    {
      title: "Post-Quantum Cryptographic Primitives for Verifiable State Machines in Distributed Ledgers",
      paperUrl: "https://eprint.iacr.org/2024/314",
      publicationYear: 2024,
      technologyCategory: TechnologyCategory.QUANTUM_COMPUTING,
      problem: "Shor's algorithm will render ECDSA and secp256k1 curves obsolete within the next decade, risking all existing crypto assets.",
      approach: "Lattice-based digital signatures (ML-DSA) coupled with fault-tolerant state-accumulator trees optimized for on-chain byte verification limits.",
      keyFindings: "Validates 512-bit lattice proofs within 380,000 gas, making quantum-resistant transactions viable on L2 rollups today.",
      researcherInsight: "The biggest barrier is signature byte size, which we compacted via structured module lattices.",
      whyItMatters: "Guarantees digital assets created today remain secure when fault-tolerant quantum computing arrives.",
      whatCommunityShouldLearn: "How lattice cryptography replaces discrete logarithm problems for verifiable computation.",
      authorId: createdUsers["satoshi"].id,
    },
    {
      title: "Zero-Trust Architecture in Heterogeneous Multi-Agent Autonomous Systems",
      paperUrl: "https://csrc.nist.gov/publications/detail/sp/800-207/final",
      publicationYear: 2023,
      technologyCategory: TechnologyCategory.CYBERSECURITY,
      problem: "Cooperative autonomous drones and ground rovers are vulnerable to GPS spoofing and lateral compromise if one agent's key is leaked.",
      approach: "Continuous mutual attestation protocol using hardware secure enclaves and threshold BLS signatures for ephemeral peer consensus.",
      keyFindings: "Eliminates single-point sensor poisoning and detects rogue drone impersonation within 45 milliseconds.",
      researcherInsight: "Never trust individual telemetry; verify consensus through localized spatial-temporal multi-witness signatures.",
      whyItMatters: "Foundational for safe autonomous drone swarms in defense and urban civilian air mobility.",
      whatCommunityShouldLearn: "The core principles of continuous cryptographic mutual attestation between flying edge devices.",
      authorId: createdUsers["elena_ai"].id,
    },
    {
      title: "Soft Exoskeletons with Neuromorphic Tactile Feedback for Industrial Ergonomics",
      paperUrl: "https://ieeexplore.ieee.org/document/9876543",
      publicationYear: 2024,
      technologyCategory: TechnologyCategory.ROBOTICS,
      problem: "Rigid industrial exoskeletons restrict natural lumbar movement and cause wearer fatigue during prolonged manual assembly tasks.",
      approach: "Pneumatic artificial muscles driven by spike-timing neuromorphic pressure sensors embedded along spinal contours.",
      keyFindings: "Lowers spine compression forces by 43% while preserving natural human range of motion up to 98%.",
      researcherInsight: "Adaptive bio-impedance feedback aligns assistive torque with the wearer's subconscious muscle intentions.",
      whyItMatters: "Prevents lifelong musculoskeletal injuries for millions of warehouse and manufacturing workers globally.",
      whatCommunityShouldLearn: "How neuromorphic sensory spikes achieve millisecond mechanical actuation with minimal power draw.",
      authorId: createdUsers["elena_ai"].id,
    },
  ];

  const createdResearch: any[] = [];
  for (const r of researchPapers) {
    const paper = await prisma.research.create({
      data: r,
    });
    createdResearch.push(paper);

    // Add initial rating
    await prisma.researchRating.create({
      data: {
        researchId: paper.id,
        userId: createdUsers["admin"].id,
        score: 5,
        comment: "Outstanding scientific rigor and exceptional relevance to the Xplover knowledge graph.",
      },
    });

    // Record XCR reward
    await prisma.xcrTransaction.create({
      data: {
        userId: r.authorId,
        amount: 10,
        transactionType: XcrTransactionType.RESEARCH_SUBMITTED,
        referenceType: "RESEARCH",
        referenceId: paper.id,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        actorId: r.authorId,
        action: "RESEARCH_SUBMITTED",
        entityType: "RESEARCH",
        entityId: paper.id,
        metadata: { title: r.title, category: r.technologyCategory },
      },
    });

    // Attestation
    await prisma.blockchainAttestation.create({
      data: {
        entityType: "RESEARCH",
        entityId: paper.id,
        contributorId: r.authorId,
        contributionType: "RESEARCH_SUBMITTED",
        transactionHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        status: AttestationStatus.CONFIRMED,
        blockchainNetwork: "arbitrumSepolia",
      },
    });
  }
  console.log(`✅ Created ${createdResearch.length} research publications with ratings, XCR & attestations.`);

  // 5. Create Educational Content with Slides
  // Content 1: Approved & Published (ZK Rollups)
  const content1 = await prisma.content.create({
    data: {
      researchId: createdResearch[0].id,
      title: "ZK-Rollups: How Ethereum Scales to 100,000 TPS Without Sacrificing Decentralization",
      targetAudience: TargetAudience.DEVELOPER,
      contentAngle: ContentAngle.TECH_IMPACT,
      hook: "What if you could verify 10,000 transactions with a single cryptographic math proof smaller than a tweet?",
      headline: "The Math Behind Ethereum's Infinite Scalability Layer",
      caption: "Swipe through to understand how Zero-Knowledge Proofs compress blockchain computation forever. Bookmark this guide! ⚡️",
      cta: "What rollup architecture are you building on? Let us know in the comments below!",
      sources: ["https://arxiv.org/abs/2401.12345", "https://ethereum.org/en/developers/docs/scaling/zk-rollups/"],
      status: ContentStatus.PUBLISHED,
      revisionCount: 0,
      createdBy: createdUsers["maya_writer"].id,
      slides: {
        create: [
          {
            slideNumber: 1,
            title: "The Blockchain Trilemma Bottleneck",
            body: "Every node in Ethereum must execute every single smart contract opcode. This creates ultimate security, but chokes throughput at ~15-30 transactions per second with soaring gas fees.",
          },
          {
            slideNumber: 2,
            title: "Enter Zero-Knowledge Proofs (ZKPs)",
            body: "Instead of executing calculations on-chain, an off-chain prover executes thousands of transactions and generates a succinct mathematical proof (SNARK/STARK) verifying all computations were valid.",
          },
          {
            slideNumber: 3,
            title: "Validity vs. Optimistic Proofs",
            body: "Optimistic rollups require a 7-day challenge period before finality. ZK-Rollups offer instant mathematical cryptographic finality as soon as the L1 contract verifies the proof.",
          },
          {
            slideNumber: 4,
            title: "Recursive Proof Compression",
            body: "Proofs verifying other proofs! By aggregating 100 micro-proofs into 1 master STARK, verification gas drops by 74%, bringing per-transaction costs down to sub-cent levels.",
          },
          {
            slideNumber: 5,
            title: "The Future: Decentralized Provers",
            body: "The final frontier is distributing proving power to global open GPU networks. Xplover researchers are actively pioneering trustless proof markets to prevent sequencer monopolies.",
          },
        ],
      },
      visualDesign: {
        create: {
          designerId: createdUsers["sofia_designer"].id,
          status: VisualDesignStatus.COMPLETED,
          remark: "Produced 5 high-fidelity dark-mode cyberpunk slides with vector circuit diagrams and typography.",
        },
      },
    },
  });

  // 5 reviews for Content 1 (all >= 7, total avg >= 8.0 -> auto approved)
  const reviewers = [
    createdUsers["rev_marcus"],
    createdUsers["rev_sarah"],
    createdUsers["rev_taro"],
    createdUsers["rev_amara"],
    createdUsers["rev_zack"],
  ];

  for (const rev of reviewers) {
    await prisma.contentReview.create({
      data: {
        contentId: content1.id,
        reviewerId: rev.id,
        accuracyScore: 9,
        relevanceScore: 9,
        clarityScore: 9,
        hookScore: 8,
        valueScore: 9,
        flowScore: 9,
        ctaScore: 8,
        consistencyScore: 9,
        comment: "Excellent technical breakdown. Translates dense cryptography into an engaging visual narrative without oversimplifying the mathematics.",
        reviewRound: 1,
      },
    });

    // Reward reviewer +5 XCR
    await prisma.xcrTransaction.create({
      data: {
        userId: rev.id,
        amount: 5,
        transactionType: XcrTransactionType.PEER_REVIEW_COMPLETED,
        referenceType: "CONTENT_REVIEW",
        referenceId: `${content1.id}_${rev.id}`,
      },
    });
  }

  // Creator reward +25 XCR
  await prisma.xcrTransaction.create({
    data: {
      userId: createdUsers["maya_writer"].id,
      amount: 25,
      transactionType: XcrTransactionType.RESEARCH_REFERENCED_CONTENT_APPROVED,
      referenceType: "CONTENT",
      referenceId: content1.id,
    },
  });

  // Content 2: Under Review (Currently 4 reviews, needs 1 more to reach 5!)
  const content2 = await prisma.content.create({
    data: {
      researchId: createdResearch[1].id,
      title: "Why Autonomous Robots Crash into Glass Doors (And How Multimodal AI Fixes It)",
      targetAudience: TargetAudience.TECH_ENTHUSIAST,
      contentAngle: ContentAngle.PRACTICAL_APPLICATION,
      hook: "Glass doors, shadows, and smoke have defeated state-of-the-art robots for decades. Here is the breakthrough solving it.",
      headline: "From Blind Spot Failures to Seamless Navigation",
      caption: "How Cambridge scientists combined event cameras and transformers to give robots human-like peripheral awareness. 🤖",
      cta: "Would you trust an autonomous rescue drone in an emergency? Share your thoughts below!",
      sources: ["https://arxiv.org/abs/2402.67890"],
      status: ContentStatus.UNDER_REVIEW,
      revisionCount: 0,
      createdBy: createdUsers["alex_chen"].id,
      slides: {
        create: [
          {
            slideNumber: 1,
            title: "The Optical Illusion Problem",
            body: "Standard RGB cameras and LiDAR struggle with transparent glass, reflective mirrors, and dense smoke particles, leading to catastrophic navigational miscalculations.",
          },
          {
            slideNumber: 2,
            title: "Neuromorphic Event Cameras",
            body: "Instead of shooting 30 frames per second, event cameras record brightness changes at microsecond resolution per pixel, completely immune to motion blur.",
          },
          {
            slideNumber: 3,
            title: "Multimodal Fusion Transformers",
            body: "A single unified model cross-attends thermal heat maps, spatial LiDAR points, and temporal event spikes in real-time.",
          },
          {
            slideNumber: 4,
            title: "Zero-Shot Field Results",
            body: "94.2% obstacle avoidance success rate in smoke-filled, completely unmapped environments without prior training on that specific terrain.",
          },
        ],
      },
    },
  });

  // 4 reviews for Content 2 (needs 5th review to trigger auto evaluation!)
  for (let i = 0; i < 4; i++) {
    const rev = reviewers[i];
    await prisma.contentReview.create({
      data: {
        contentId: content2.id,
        reviewerId: rev.id,
        accuracyScore: 8,
        relevanceScore: 9,
        clarityScore: 8,
        hookScore: 9,
        valueScore: 8,
        flowScore: 8,
        ctaScore: 7,
        consistencyScore: 8,
        comment: `Solid explanation of neuromorphic vision. Clear slides and strong hook. Slide 3 could highlight the inference FPS. (Reviewer ${i + 1})`,
        reviewRound: 1,
      },
    });

    await prisma.xcrTransaction.create({
      data: {
        userId: rev.id,
        amount: 5,
        transactionType: XcrTransactionType.PEER_REVIEW_COMPLETED,
        referenceType: "CONTENT_REVIEW",
        referenceId: `${content2.id}_${rev.id}`,
      },
    });
  }

  // Content 3: Ready for Visual Design (Approved)
  const content3 = await prisma.content.create({
    data: {
      researchId: createdResearch[2].id,
      title: "Quantum Supremacy is Coming for Your Crypto: Are You Safe?",
      targetAudience: TargetAudience.GENERAL_PUBLIC,
      contentAngle: ContentAngle.FUTURE,
      hook: "Will a quantum computer empty your Bitcoin wallet in 2030? Here's the mathematical reality.",
      headline: "The Race for Post-Quantum Blockchain Cryptography",
      caption: "Don't panic, but prepare. How lattice cryptography will safeguard digital wealth from Shor's algorithm.",
      cta: "Save this post to stay ahead of quantum security updates!",
      sources: ["https://eprint.iacr.org/2024/314"],
      status: ContentStatus.READY_FOR_VISUAL,
      revisionCount: 0,
      createdBy: createdUsers["maya_writer"].id,
      slides: {
        create: [
          {
            slideNumber: 1,
            title: "Shor's Algorithm & Elliptic Curves",
            body: "Modern crypto relies on ECDSA. A quantum computer with 4,000 stable logical qubits could derive your private key from your public key in hours.",
          },
          {
            slideNumber: 2,
            title: "The Lattice Defense",
            body: "Lattice-based mathematics constructs geometric grid problems in 500+ dimensions that even quantum algorithms have zero mathematical advantage in cracking.",
          },
          {
            slideNumber: 3,
            title: "What Needs Upgrading?",
            body: "Wallet signatures and consensus algorithms must migrate to quantum-resistant primitives before the cryptanalytic horizon arrives.",
          },
        ],
      },
    },
  });

  // Content 4: Draft
  await prisma.content.create({
    data: {
      researchId: createdResearch[3].id,
      title: "Zero-Trust Autonomous Swarms: How Flying Drones Spot Rogue Imposters",
      targetAudience: TargetAudience.DEVELOPER,
      contentAngle: ContentAngle.TECH_IMPACT,
      hook: "How do 100 autonomous drones know one of their peers hasn't been hacked mid-flight?",
      headline: "Cryptographic Mutual Attestation in the Skies",
      caption: "Draft carousel exploring hardware enclave security in multi-agent drone swarms.",
      cta: "Follow for the completed breakdown coming soon!",
      sources: ["https://csrc.nist.gov/publications/detail/sp/800-207/final"],
      status: ContentStatus.IN_VISUAL_DESIGN,
      revisionCount: 0,
      createdBy: createdUsers["alex_chen"].id,
      slides: {
        create: [
          {
            slideNumber: 1,
            title: "The Drone Swarm Vulnerability",
            body: "If one drone is physically captured or has its firmware modified, traditional networks trust it by default.",
          },
          {
            slideNumber: 2,
            title: "Continuous Hardware Attestation",
            body: "Using TPM enclaves and BLS threshold signatures, drones verify each other's cryptographic health every 50ms.",
          },
        ],
      },
    },
  });

  console.log("✅ Seeded content carousels across all statuses (Published, Under Review, Ready for Visual, Draft).");
  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
