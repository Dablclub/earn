import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Switch,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { usePostHog } from 'posthog-js/react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { useUser } from '@/store/user';

export const EmailSettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { user, refetchUser } = useUser();

  const posthog = usePostHog();

  const emailSettings = user?.emailSettings || [];

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    emailSettings.map((setting) => setting.category),
  );

  const [isUpdating, setIsUpdating] = useState(false);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const updateEmailSettings = async () => {
    try {
      posthog.capture('confirm_email preferences');
      setIsUpdating(true);
      await axios.post('/api/user/update-email-settings', {
        categories: selectedCategories,
      });

      await refetchUser();

      setIsUpdating(false);
      onClose();
      toast.success('Email preferences updated');
    } catch (error) {
      console.error('Error updating email preferences:', error);
      toast.error('Failed to update email preferences.');
      setIsUpdating(false);
    }
  };

  const showSponsorAlerts = user?.currentSponsorId;
  const showTalentAlerts = user?.isTalentFilled;

  const AlertOption = ({
    title,
    category,
  }: {
    title: string;
    category: string;
  }) => (
    <Flex align="center" justify="space-between">
      <Text mt={1} color="brand.slate.500" fontWeight={500}>
        {title}
      </Text>
      <Switch
        mt={0.5}
        isChecked={selectedCategories.includes(category)}
        onChange={() => handleCategoryChange(category)}
      />
    </Flex>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent p={2}>
          <ModalCloseButton mt={2} />
          <ModalBody>
            <Text color="brand.slate.700" fontSize="2xl" fontWeight={600}>
              Update Email Preferences
            </Text>
            <Text mt={1} color="brand.slate.400" fontWeight={500}>
              Tell us which emails you would like to receive!
            </Text>
            {showSponsorAlerts && (
              <Box mt={6}>
                <Text
                  mt={6}
                  mb={1}
                  color="brand.slate.400"
                  fontSize="sm"
                  letterSpacing={0.8}
                >
                  SPONSOR ALERTS
                </Text>
                <AlertOption
                  title="New submissions received for your listing"
                  category="submissionSponsor"
                />
                <AlertOption
                  title="Comments Received on your listing"
                  category="commentSponsor"
                />
                <AlertOption
                  title="Deadline related reminders"
                  category="deadlineSponsor"
                />
              </Box>
            )}
            {showTalentAlerts && (
              <Box mt={6}>
                <Text
                  mt={6}
                  mb={1}
                  color="brand.slate.400"
                  fontSize="sm"
                  letterSpacing={0.8}
                >
                  TALENT ALERTS
                </Text>
                <AlertOption
                  title="Weekly Roundup of new listings"
                  category="weeklyListingRoundup"
                />
                <AlertOption
                  title="New listings added for my skills"
                  category="createListing"
                />
                <AlertOption
                  title="Likes and comments on my submissions"
                  category="commentOrLikeSubmission"
                />
                <AlertOption
                  title="Sponsor Invitation Emails (Scout)"
                  category="scoutInvite"
                />
              </Box>
            )}
            {(showTalentAlerts || showSponsorAlerts) && (
              <Box mt={6}>
                <Text
                  mt={6}
                  mb={1}
                  color="brand.slate.400"
                  fontSize="sm"
                  letterSpacing={0.8}
                >
                  GENERAL ALERTS
                </Text>
                <AlertOption
                  title="Comment replies and tags"
                  category="replyOrTagComment"
                />
                <AlertOption
                  title="Product updates and newsletters"
                  category="productAndNewsletter"
                />
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              className="ph-no-capture"
              w="100%"
              colorScheme="blue"
              isLoading={isUpdating}
              loadingText="Updating Preferences.."
              onClick={updateEmailSettings}
            >
              Update Preferences
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
