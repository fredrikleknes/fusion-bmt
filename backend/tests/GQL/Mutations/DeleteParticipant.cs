using Xunit;
using System;
using System.Linq;

using api.Models;
using api.Services;
using api.GQL;


namespace tests
{
    public class DeleteParticipantMutation : MutationTest
    {
        private readonly Evaluation _evaluation;
        private readonly Participant _facilitator;
        private readonly Participant _organizationLead;
        private readonly Participant _participant;
        private readonly Participant _readonly;

        public DeleteParticipantMutation() {
            _evaluation = CreateEvaluation();
            _facilitator = _evaluation.Participants.First();
            _authService.LoginUser(_facilitator);

            _organizationLead = CreateParticipant(_evaluation, role: Role.OrganizationLead);
            _participant = CreateParticipant(_evaluation, role: Role.Participant);
            _readonly = CreateParticipant(_evaluation, role: Role.ReadOnly);
        }

        /* Tests */

        [Fact]
        public void FacilitatorCanUseMutation()
        {
            AssertCanDelete(_facilitator);
        }

        [Fact]
        public void OrganizationLeadCanUseMutation()
        {
            AssertCanDelete(_organizationLead);
        }

        [Fact]
        public void ParticipantIsUnauthorized()
        {
            AssertIsNotAuthorized(_participant.AzureUniqueId);
        }

        [Fact]
        public void ReadOnlyIsUnauthorized()
        {
            AssertIsNotAuthorized(_readonly.AzureUniqueId);
        }

        [Fact]
        public void NonParcipantIsUnauthorized()
        {
            string AzureUniqueId = Randomize.Integer().ToString();
            AssertIsNotAuthorized(AzureUniqueId);
        }

        /* Helper methods */

        private void AssertCanDelete(Participant user)
        {
            var toDelete = CreateParticipant(
                evaluation: _evaluation,
                azureUniqueId: Randomize.Integer().ToString()
            );

            _authService.LoginUser(user);
            int participants = NumberOfParticipants(_evaluation);
            _mutation.DeleteParticipant(toDelete.Id);
            Assert.True(NumberOfParticipants(_evaluation) == participants - 1);
        }

        private void AssertIsNotAuthorized(string azureUniqueId)
        {
            var toDelete = CreateParticipant(
                evaluation: _evaluation,
                azureUniqueId: Randomize.Integer().ToString()
            );

            _authService.LoginUser(azureUniqueId);
            Assert.Throws<UnauthorizedAccessException>(() =>
                _mutation.DeleteParticipant(toDelete.Id)
            );
        }
    }
}
