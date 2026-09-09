// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ContributionAttestation
 * @notice On-chain attestation registry for Xplover platform contributions.
 * @dev Records cryptographic proof of contributions without storing large data.
 *      PostgreSQL remains the source of truth; this contract provides immutable attestation.
 */
contract ContributionAttestation is Ownable {
    /// @notice Contribution types supported by Xplover
    string public constant RESEARCH_SUBMITTED = "RESEARCH_SUBMITTED";
    string public constant RESEARCH_REFERENCED = "RESEARCH_REFERENCED";
    string public constant PEER_REVIEW_COMPLETED = "PEER_REVIEW_COMPLETED";
    string public constant CONTENT_APPROVED = "CONTENT_APPROVED";
    string public constant VISUAL_COMPLETED = "VISUAL_COMPLETED";
    string public constant XCR_DISTRIBUTED = "XCR_DISTRIBUTED";

    /// @notice Emitted when a contribution is recorded on-chain
    event ContributionRecorded(
        address indexed contributor,
        string contributionType,
        string contributionId,
        uint256 timestamp,
        uint256 indexed attestationId
    );

    struct Attestation {
        address contributor;
        string contributionType;
        string contributionId; // UUID from PostgreSQL
        uint256 timestamp;
        bool exists;
    }

    /// @notice Total number of attestations recorded
    uint256 public attestationCount;

    /// @notice Mapping from attestation ID to attestation data
    mapping(uint256 => Attestation) public attestations;

    /// @notice Mapping from contribution hash to attestation ID (for deduplication)
    /// @dev hash = keccak256(abi.encodePacked(contributionType, contributionId))
    mapping(bytes32 => uint256) public contributionHashToId;

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Record a contribution attestation on-chain.
     * @dev Only callable by the owner (backend service wallet).
     *      Idempotent — duplicate contributions are rejected.
     * @param contributor The wallet address of the contributor (may be zero if no wallet connected).
     * @param contributionType The type of contribution (see constants above).
     * @param contributionId The UUID of the contribution record in PostgreSQL.
     * @return attestationId The ID of the newly created attestation.
     */
    function recordContribution(
        address contributor,
        string calldata contributionType,
        string calldata contributionId
    ) external onlyOwner returns (uint256 attestationId) {
        require(bytes(contributionType).length > 0, "CA: empty contribution type");
        require(bytes(contributionId).length > 0, "CA: empty contribution ID");

        // Prevent duplicate attestations for the same contribution
        bytes32 contributionHash = keccak256(abi.encodePacked(contributionType, contributionId));
        require(contributionHashToId[contributionHash] == 0, "CA: contribution already attested");

        attestationCount++;
        attestationId = attestationCount;

        attestations[attestationId] = Attestation({
            contributor: contributor,
            contributionType: contributionType,
            contributionId: contributionId,
            timestamp: block.timestamp,
            exists: true
        });

        contributionHashToId[contributionHash] = attestationId;

        emit ContributionRecorded(
            contributor,
            contributionType,
            contributionId,
            block.timestamp,
            attestationId
        );

        return attestationId;
    }

    /**
     * @notice Batch record multiple contribution attestations.
     * @dev Gas-efficient batch operation.
     */
    function batchRecordContributions(
        address[] calldata contributors,
        string[] calldata contributionTypes,
        string[] calldata contributionIds
    ) external onlyOwner {
        require(contributors.length == contributionTypes.length, "CA: array length mismatch");
        require(contributors.length == contributionIds.length, "CA: array length mismatch");
        require(contributors.length <= 50, "CA: batch too large");

        for (uint256 i = 0; i < contributors.length; i++) {
            bytes32 contributionHash = keccak256(abi.encodePacked(contributionTypes[i], contributionIds[i]));
            
            // Skip already attested contributions (idempotent)
            if (contributionHashToId[contributionHash] != 0) continue;

            attestationCount++;
            uint256 attestationId = attestationCount;

            attestations[attestationId] = Attestation({
                contributor: contributors[i],
                contributionType: contributionTypes[i],
                contributionId: contributionIds[i],
                timestamp: block.timestamp,
                exists: true
            });

            contributionHashToId[contributionHash] = attestationId;

            emit ContributionRecorded(
                contributors[i],
                contributionTypes[i],
                contributionIds[i],
                block.timestamp,
                attestationId
            );
        }
    }

    /**
     * @notice Check if a contribution has been attested.
     * @param contributionType The type of contribution.
     * @param contributionId The UUID of the contribution.
     * @return attested Whether the contribution has been attested.
     * @return attestationId The ID of the attestation (0 if not attested).
     */
    function hasAttestation(
        string calldata contributionType,
        string calldata contributionId
    ) external view returns (bool attested, uint256 attestationId) {
        bytes32 contributionHash = keccak256(abi.encodePacked(contributionType, contributionId));
        attestationId = contributionHashToId[contributionHash];
        attested = attestationId != 0;
    }

    /**
     * @notice Get attestation details by ID.
     */
    function getAttestation(uint256 attestationId)
        external
        view
        returns (
            address contributor,
            string memory contributionType,
            string memory contributionId,
            uint256 timestamp
        )
    {
        require(attestations[attestationId].exists, "CA: attestation not found");
        Attestation memory a = attestations[attestationId];
        return (a.contributor, a.contributionType, a.contributionId, a.timestamp);
    }
}
