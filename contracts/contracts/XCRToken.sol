// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title XCRToken
 * @notice XCR (Xplover Community Research) — ERC-20 contribution token for the Xplover platform.
 * @dev Only the owner (backend wallet) can mint tokens. 
 *      Tokens represent community contribution reputation and cannot be transferred
 *      without explicit user action, preserving their reputation nature.
 */
contract XCRToken is ERC20, Ownable, ERC20Burnable {
    /// @notice Emitted when XCR is minted as a contribution reward
    event ContributionRewarded(
        address indexed contributor,
        uint256 amount,
        string contributionType,
        string referenceId
    );

    /// @notice Minimum amount that can be minted in a single call
    uint256 public constant MIN_MINT_AMOUNT = 1 * 10 ** 18;
    
    /// @notice Maximum amount that can be minted in a single call (safety limit)
    uint256 public constant MAX_MINT_AMOUNT = 1000 * 10 ** 18;

    constructor(address initialOwner)
        ERC20("Xplover Community Research", "XCR")
        Ownable(initialOwner)
    {}

    /**
     * @notice Mint XCR tokens as a contribution reward.
     * @dev Only callable by the owner (backend service wallet).
     * @param contributor The address of the contributor receiving the reward.
     * @param amount The amount of XCR to mint (in wei, 18 decimals).
     * @param contributionType The type of contribution (e.g., "RESEARCH_SUBMITTED").
     * @param referenceId The off-chain reference ID for the contribution (e.g., research UUID).
     */
    function mintReward(
        address contributor,
        uint256 amount,
        string calldata contributionType,
        string calldata referenceId
    ) external onlyOwner {
        require(contributor != address(0), "XCR: invalid contributor address");
        require(amount >= MIN_MINT_AMOUNT, "XCR: amount below minimum");
        require(amount <= MAX_MINT_AMOUNT, "XCR: amount exceeds maximum");
        require(bytes(contributionType).length > 0, "XCR: empty contribution type");
        require(bytes(referenceId).length > 0, "XCR: empty reference ID");

        _mint(contributor, amount);

        emit ContributionRewarded(contributor, amount, contributionType, referenceId);
    }

    /**
     * @notice Batch mint XCR rewards for multiple contributors.
     * @dev Gas-efficient batch operation for multiple rewards.
     */
    function batchMintReward(
        address[] calldata contributors,
        uint256[] calldata amounts,
        string[] calldata contributionTypes,
        string[] calldata referenceIds
    ) external onlyOwner {
        require(contributors.length == amounts.length, "XCR: array length mismatch");
        require(contributors.length == contributionTypes.length, "XCR: array length mismatch");
        require(contributors.length == referenceIds.length, "XCR: array length mismatch");
        require(contributors.length <= 50, "XCR: batch too large");

        for (uint256 i = 0; i < contributors.length; i++) {
            require(contributors[i] != address(0), "XCR: invalid contributor address");
            require(amounts[i] >= MIN_MINT_AMOUNT, "XCR: amount below minimum");
            require(amounts[i] <= MAX_MINT_AMOUNT, "XCR: amount exceeds maximum");

            _mint(contributors[i], amounts[i]);
            emit ContributionRewarded(contributors[i], amounts[i], contributionTypes[i], referenceIds[i]);
        }
    }
}
